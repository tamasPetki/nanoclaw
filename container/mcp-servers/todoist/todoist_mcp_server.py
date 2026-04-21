# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "mcp",
#     "httpx",
#     "pydantic",
# ]
# ///
"""
Todoist API MCP Server using FastMCP.

A complete Model Context Protocol server for the Todoist API with REST v1 endpoints.
Uses Bearer token authentication and provides comprehensive tools for task, project,
section, comment, and label management.

API Token: Read from TODOIST_API_TOKEN env var (with default provided)
Base URL: https://api.todoist.com/api/v1
Transport: stdio (local use with NanoClaw and Claude Code)
"""

import json
import os
from typing import Any, Optional
from datetime import datetime

import httpx
from mcp.server.fastmcp import FastMCP
from pydantic import BaseModel, Field


# Initialize MCP server
mcp = FastMCP("todoist_mcp")

# Configuration
API_TOKEN = os.environ["TODOIST_API_TOKEN"]
BASE_URL = "https://api.todoist.com/api/v1"

# HTTP client (will be managed as async)
http_client = httpx.AsyncClient(
    headers={
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json",
    },
    timeout=30.0,
)


# ============================================================================
# Helper Functions
# ============================================================================


async def _make_request(
    method: str,
    endpoint: str,
    params: Optional[dict] = None,
    json_body: Optional[dict] = None,
) -> dict:
    """
    Make an HTTP request to the Todoist API.

    Args:
        method: HTTP method (GET, POST, DELETE)
        endpoint: API endpoint (e.g., '/projects')
        params: Query parameters dict
        json_body: JSON body for POST/PUT requests

    Returns:
        Response JSON as dict

    Raises:
        HTTPError: On API errors
    """
    url = f"{BASE_URL}{endpoint}"

    try:
        response = await http_client.request(
            method, url, params=params, json=json_body
        )
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as e:
        await _handle_error(e)


async def _handle_error(error: Exception) -> None:
    """
    Handle and raise formatted API errors.

    Args:
        error: The exception to handle

    Raises:
        RuntimeError: Always raises with formatted error message
    """
    if isinstance(error, httpx.HTTPStatusError):
        try:
            error_detail = error.response.json()
            message = error_detail.get("error", {}).get("message", str(error))
        except (json.JSONDecodeError, KeyError):
            message = str(error)
        raise RuntimeError(f"Todoist API Error: {message}")
    raise RuntimeError(f"Todoist API Error: {str(error)}")


# ============================================================================
# Pydantic Models for Input Validation
# ============================================================================


class PaginationParams(BaseModel):
    """Cursor-based pagination parameters."""

    cursor: Optional[str] = Field(None, description="Pagination cursor")
    limit: Optional[int] = Field(None, description="Max items to return (1-200)")


class GetProjectsInput(PaginationParams):
    """Get projects input."""

    pass


class GetTasksInput(BaseModel):
    """Get tasks input with multiple filter options."""

    project_id: Optional[str] = Field(None, description="Filter by project ID")
    section_id: Optional[str] = Field(None, description="Filter by section ID")
    parent_id: Optional[str] = Field(None, description="Filter by parent task ID")
    label: Optional[str] = Field(None, description="Filter by label")
    ids: Optional[str] = Field(None, description="Comma-separated task IDs")
    cursor: Optional[str] = Field(None, description="Pagination cursor")
    limit: Optional[int] = Field(None, description="Max items to return")


class FilterTasksInput(BaseModel):
    """Filter tasks using Todoist filter syntax."""

    query: str = Field(..., description="Todoist filter query (e.g., 'today | overdue')")
    cursor: Optional[str] = Field(None, description="Pagination cursor")
    limit: Optional[int] = Field(None, description="Max items to return")


class GetCompletedTasksInput(BaseModel):
    """Get completed tasks input."""

    since: str = Field(..., description="ISO 8601 datetime (e.g., '2026-01-01T00:00:00Z')")
    until: str = Field(..., description="ISO 8601 datetime (e.g., '2026-01-31T23:59:59Z')")
    cursor: Optional[str] = Field(None, description="Pagination cursor")
    limit: Optional[int] = Field(None, description="Max items to return")


class GetCommentsInput(BaseModel):
    """Get comments input - requires exactly one of task_id or project_id."""

    task_id: Optional[str] = Field(None, description="Task ID to get comments for")
    project_id: Optional[str] = Field(None, description="Project ID to get comments for")
    cursor: Optional[str] = Field(None, description="Pagination cursor")
    limit: Optional[int] = Field(None, description="Max items to return")


class CreateTaskInput(BaseModel):
    """Create task input."""

    content: str = Field(..., description="Task title (required)")
    description: Optional[str] = Field(None, description="Task description")
    project_id: Optional[str] = Field(None, description="Project ID")
    section_id: Optional[str] = Field(None, description="Section ID")
    parent_id: Optional[str] = Field(None, description="Parent task ID")
    labels: Optional[list] = Field(None, description="List of label names")
    priority: Optional[int] = Field(None, description="Priority 1-4 (4=highest)")
    due_string: Optional[str] = Field(None, description="Due date as natural language")
    due_date: Optional[str] = Field(None, description="Due date as YYYY-MM-DD")
    due_datetime: Optional[str] = Field(None, description="Due datetime as ISO 8601")
    due_lang: Optional[str] = Field(None, description="Language for due_string parsing")
    duration: Optional[int] = Field(None, description="Task duration value")
    duration_unit: Optional[str] = Field(None, description="Duration unit (minute/hour)")
    deadline_date: Optional[str] = Field(None, description="Deadline date as YYYY-MM-DD")
    assignee_id: Optional[str] = Field(None, description="User ID to assign to")
    order: Optional[int] = Field(None, description="Order in section")


class UpdateTaskInput(BaseModel):
    """Update task input."""

    task_id: str = Field(..., description="Task ID to update")
    content: Optional[str] = Field(None, description="New task title")
    description: Optional[str] = Field(None, description="New description")
    labels: Optional[list] = Field(None, description="New labels")
    priority: Optional[int] = Field(None, description="New priority 1-4")
    due_string: Optional[str] = Field(None, description="New due date")
    due_date: Optional[str] = Field(None, description="New due date YYYY-MM-DD")
    due_datetime: Optional[str] = Field(None, description="New due datetime ISO 8601")
    due_lang: Optional[str] = Field(None, description="Language for parsing")
    assignee_id: Optional[str] = Field(None, description="New assignee user ID")
    duration: Optional[int] = Field(None, description="New duration value")
    duration_unit: Optional[str] = Field(None, description="New duration unit")
    deadline_date: Optional[str] = Field(None, description="New deadline date")


class MoveTaskInput(BaseModel):
    """Move task input."""

    task_id: str = Field(..., description="Task ID to move")
    project_id: Optional[str] = Field(None, description="New project ID")
    section_id: Optional[str] = Field(None, description="New section ID")
    parent_id: Optional[str] = Field(None, description="New parent task ID")


class QuickAddTaskInput(BaseModel):
    """Quick add task input."""

    text: str = Field(..., description="Task text with natural language parsing")
    note: Optional[str] = Field(None, description="Optional note")
    auto_reminder: Optional[bool] = Field(None, description="Auto-set reminder")


class CreateProjectInput(BaseModel):
    """Create project input."""

    name: str = Field(..., description="Project name (required)")
    description: Optional[str] = Field(None, description="Project description")
    parent_id: Optional[str] = Field(None, description="Parent project ID")
    color: Optional[str] = Field(None, description="Color name/code")
    is_favorite: Optional[bool] = Field(None, description="Mark as favorite")
    view_style: Optional[str] = Field(None, description="View style (list/board/calendar)")


class UpdateProjectInput(BaseModel):
    """Update project input."""

    project_id: str = Field(..., description="Project ID to update")
    name: Optional[str] = Field(None, description="New name")
    description: Optional[str] = Field(None, description="New description")
    color: Optional[str] = Field(None, description="New color")
    is_favorite: Optional[bool] = Field(None, description="New favorite status")
    view_style: Optional[str] = Field(None, description="New view style")


class CreateSectionInput(BaseModel):
    """Create section input."""

    name: str = Field(..., description="Section name (required)")
    project_id: str = Field(..., description="Project ID (required)")
    order: Optional[int] = Field(None, description="Section order")


class UpdateSectionInput(BaseModel):
    """Update section input."""

    section_id: str = Field(..., description="Section ID to update")
    name: Optional[str] = Field(None, description="New section name")


class CreateCommentInput(BaseModel):
    """Create comment input."""

    content: str = Field(..., description="Comment text (required)")
    task_id: Optional[str] = Field(None, description="Task ID (use one of task_id/project_id)")
    project_id: Optional[str] = Field(
        None, description="Project ID (use one of task_id/project_id)"
    )


class UpdateCommentInput(BaseModel):
    """Update comment input."""

    comment_id: str = Field(..., description="Comment ID to update")
    content: str = Field(..., description="New comment text")


class CreateLabelInput(BaseModel):
    """Create label input."""

    name: str = Field(..., description="Label name (required)")
    order: Optional[int] = Field(None, description="Label order")
    color: Optional[str] = Field(None, description="Label color")


class UpdateLabelInput(BaseModel):
    """Update label input."""

    label_id: str = Field(..., description="Label ID to update")
    name: Optional[str] = Field(None, description="New name")
    order: Optional[int] = Field(None, description="New order")
    color: Optional[str] = Field(None, description="New color")


class SearchProjectsInput(BaseModel):
    """Search projects input."""

    query: str = Field(..., description="Search query string")


class SearchSectionsInput(BaseModel):
    """Search sections input."""

    query: str = Field(..., description="Search query string")
    project_id: str = Field(..., description="Project ID to search in")


class SearchLabelsInput(BaseModel):
    """Search labels input."""

    query: str = Field(..., description="Search query string")


class GetSectionsInput(PaginationParams):
    """Get sections input."""

    project_id: Optional[str] = Field(None, description="Filter by project ID")


class GetLabelsInput(PaginationParams):
    """Get labels input."""

    pass


# ============================================================================
# READ OPERATION TOOLS
# ============================================================================


@mcp.tool(
    name="todoist_get_projects",
    description="Get list of projects with cursor-based pagination",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_projects(input: GetProjectsInput) -> str:
    """
    List all projects.

    Returns paginated list of projects. Use cursor from response for next page.
    """
    params = {}
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/projects", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_project",
    description="Get a single project by ID",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_project(project_id: str) -> str:
    """
    Retrieve details of a specific project.

    Args:
        project_id: The ID of the project to retrieve
    """
    result = await _make_request("GET", f"/projects/{project_id}")
    return json.dumps(result)


@mcp.tool(
    name="todoist_search_projects",
    description="Search projects by name",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def search_projects(input: SearchProjectsInput) -> str:
    """
    Search for projects by name using query string.

    Args:
        input: Search query
    """
    params = {"query": input.query}
    result = await _make_request("GET", "/projects/search", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_tasks",
    description="Get tasks with multiple filter options",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_tasks(input: GetTasksInput) -> str:
    """
    List tasks with optional filtering by project, section, parent, or label.

    Can also filter by specific task IDs or use pagination cursor.
    """
    params = {}
    if input.project_id:
        params["project_id"] = input.project_id
    if input.section_id:
        params["section_id"] = input.section_id
    if input.parent_id:
        params["parent_id"] = input.parent_id
    if input.label:
        params["label"] = input.label
    if input.ids:
        params["ids"] = input.ids
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/tasks", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_task",
    description="Get a single task by ID",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_task(task_id: str) -> str:
    """
    Retrieve details of a specific task.

    Args:
        task_id: The ID of the task to retrieve
    """
    result = await _make_request("GET", f"/tasks/{task_id}")
    return json.dumps(result)


@mcp.tool(
    name="todoist_filter_tasks",
    description="Filter tasks using Todoist filter syntax",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def filter_tasks(input: FilterTasksInput) -> str:
    """
    Search tasks using Todoist filter syntax (e.g., 'today | overdue').

    Supports full Todoist filter query language.
    """
    params = {"query": input.query}
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/tasks/filter", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_completed_tasks",
    description="Get completed tasks within a date range",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_completed_tasks(input: GetCompletedTasksInput) -> str:
    """
    Get completed tasks between two ISO 8601 datetimes.

    Args:
        input: Required since and until as ISO 8601 strings
    """
    params = {"since": input.since, "until": input.until}
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/tasks/completed/by_completion_date", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_sections",
    description="Get sections with optional project filter",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_sections(input: GetSectionsInput) -> str:
    """
    List sections, optionally filtered by project.

    Use cursor-based pagination.
    """
    params = {}
    if input.project_id:
        params["project_id"] = input.project_id
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/sections", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_section",
    description="Get a single section by ID",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_section(section_id: str) -> str:
    """
    Retrieve details of a specific section.

    Args:
        section_id: The ID of the section to retrieve
    """
    result = await _make_request("GET", f"/sections/{section_id}")
    return json.dumps(result)


@mcp.tool(
    name="todoist_search_sections",
    description="Search sections by name within a project",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def search_sections(input: SearchSectionsInput) -> str:
    """
    Search for sections in a project by name.

    Args:
        input: Query string and project_id (required)
    """
    params = {"query": input.query, "project_id": input.project_id}
    result = await _make_request("GET", "/sections/search", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_comments",
    description="Get comments for a task or project",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_comments(input: GetCommentsInput) -> str:
    """
    List comments. Requires exactly one of task_id or project_id.

    Args:
        input: Must provide either task_id or project_id (not both, not neither)
    """
    if not input.task_id and not input.project_id:
        raise ValueError("Must provide either task_id or project_id")
    if input.task_id and input.project_id:
        raise ValueError("Provide only one of task_id or project_id")

    params = {}
    if input.task_id:
        params["task_id"] = input.task_id
    if input.project_id:
        params["project_id"] = input.project_id
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/comments", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_comment",
    description="Get a single comment by ID",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_comment(comment_id: str) -> str:
    """
    Retrieve details of a specific comment.

    Args:
        comment_id: The ID of the comment to retrieve
    """
    result = await _make_request("GET", f"/comments/{comment_id}")
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_labels",
    description="Get list of labels",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_labels(input: GetLabelsInput) -> str:
    """
    List all labels with cursor-based pagination.

    Returns paginated list of labels.
    """
    params = {}
    if input.cursor:
        params["cursor"] = input.cursor
    if input.limit:
        params["limit"] = input.limit

    result = await _make_request("GET", "/labels", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_search_labels",
    description="Search labels by name",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def search_labels(input: SearchLabelsInput) -> str:
    """
    Search for labels by name using query string.

    Args:
        input: Search query
    """
    params = {"query": input.query}
    result = await _make_request("GET", "/labels/search", params=params)
    return json.dumps(result)


@mcp.tool(
    name="todoist_get_collaborators",
    description="Get collaborators for a project",
    annotations={"readOnlyHint": True, "destructiveHint": False, "openWorldHint": True},
)
async def get_collaborators(project_id: str) -> str:
    """
    List all collaborators on a project.

    Args:
        project_id: The ID of the project
    """
    result = await _make_request("GET", f"/projects/{project_id}/collaborators")
    return json.dumps(result)


# ============================================================================
# WRITE OPERATION TOOLS - TASKS
# ============================================================================


@mcp.tool(
    name="todoist_create_task",
    description="Create a new task",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def create_task(input: CreateTaskInput) -> str:
    """
    Create a new task with optional description, project, section, labels, and due date.

    Args:
        input: CreateTaskInput with content (required) and other optional fields
    """
    body = {"content": input.content}

    if input.description is not None:
        body["description"] = input.description
    if input.project_id is not None:
        body["project_id"] = input.project_id
    if input.section_id is not None:
        body["section_id"] = input.section_id
    if input.parent_id is not None:
        body["parent_id"] = input.parent_id
    if input.labels is not None:
        body["labels"] = input.labels
    if input.priority is not None:
        body["priority"] = input.priority
    if input.due_string is not None:
        body["due_string"] = input.due_string
    if input.due_date is not None:
        body["due_date"] = input.due_date
    if input.due_datetime is not None:
        body["due_datetime"] = input.due_datetime
    if input.due_lang is not None:
        body["due_lang"] = input.due_lang
    if input.duration is not None:
        body["duration"] = input.duration
    if input.duration_unit is not None:
        body["duration_unit"] = input.duration_unit
    if input.deadline_date is not None:
        body["deadline_date"] = input.deadline_date
    if input.assignee_id is not None:
        body["assignee_id"] = input.assignee_id
    if input.order is not None:
        body["order"] = input.order

    result = await _make_request("POST", "/tasks", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_update_task",
    description="Update an existing task",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def update_task(input: UpdateTaskInput) -> str:
    """
    Update a task's properties.

    Args:
        input: UpdateTaskInput with task_id (required) and fields to update
    """
    body = {}

    if input.content is not None:
        body["content"] = input.content
    if input.description is not None:
        body["description"] = input.description
    if input.labels is not None:
        body["labels"] = input.labels
    if input.priority is not None:
        body["priority"] = input.priority
    if input.due_string is not None:
        body["due_string"] = input.due_string
    if input.due_date is not None:
        body["due_date"] = input.due_date
    if input.due_datetime is not None:
        body["due_datetime"] = input.due_datetime
    if input.due_lang is not None:
        body["due_lang"] = input.due_lang
    if input.assignee_id is not None:
        body["assignee_id"] = input.assignee_id
    if input.duration is not None:
        body["duration"] = input.duration
    if input.duration_unit is not None:
        body["duration_unit"] = input.duration_unit
    if input.deadline_date is not None:
        body["deadline_date"] = input.deadline_date

    result = await _make_request("POST", f"/tasks/{input.task_id}", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_close_task",
    description="Mark a task as complete",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def close_task(task_id: str) -> str:
    """
    Mark a task as completed.

    Args:
        task_id: The ID of the task to close
    """
    result = await _make_request("POST", f"/tasks/{task_id}/close")
    return json.dumps(result)


@mcp.tool(
    name="todoist_reopen_task",
    description="Reopen a completed task",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def reopen_task(task_id: str) -> str:
    """
    Mark a completed task as incomplete again.

    Args:
        task_id: The ID of the task to reopen
    """
    result = await _make_request("POST", f"/tasks/{task_id}/reopen")
    return json.dumps(result)


@mcp.tool(
    name="todoist_delete_task",
    description="Delete a task permanently",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def delete_task(task_id: str) -> str:
    """
    Permanently delete a task.

    This action cannot be undone.

    Args:
        task_id: The ID of the task to delete
    """
    result = await _make_request("DELETE", f"/tasks/{task_id}")
    return json.dumps(result)


@mcp.tool(
    name="todoist_move_task",
    description="Move a task to a different project/section/parent",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def move_task(input: MoveTaskInput) -> str:
    """
    Move a task to a different project, section, or make it a subtask.

    Args:
        input: MoveTaskInput with task_id and destination fields
    """
    body = {}

    if input.project_id is not None:
        body["project_id"] = input.project_id
    if input.section_id is not None:
        body["section_id"] = input.section_id
    if input.parent_id is not None:
        body["parent_id"] = input.parent_id

    result = await _make_request("POST", f"/tasks/{input.task_id}/move", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_quick_add_task",
    description="Create a task using natural language parsing",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def quick_add_task(input: QuickAddTaskInput) -> str:
    """
    Create a task with natural language parsing (e.g., 'Buy milk tomorrow at 5pm').

    Args:
        input: QuickAddTaskInput with text (required) and optional note/auto_reminder
    """
    body = {"text": input.text}

    if input.note is not None:
        body["note"] = input.note
    if input.auto_reminder is not None:
        body["auto_reminder"] = input.auto_reminder

    result = await _make_request("POST", "/tasks/quick", json_body=body)
    return json.dumps(result)


# ============================================================================
# WRITE OPERATION TOOLS - PROJECTS
# ============================================================================


@mcp.tool(
    name="todoist_create_project",
    description="Create a new project",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def create_project(input: CreateProjectInput) -> str:
    """
    Create a new project with optional description, parent, color, and view style.

    Args:
        input: CreateProjectInput with name (required) and other optional fields
    """
    body = {"name": input.name}

    if input.description is not None:
        body["description"] = input.description
    if input.parent_id is not None:
        body["parent_id"] = input.parent_id
    if input.color is not None:
        body["color"] = input.color
    if input.is_favorite is not None:
        body["is_favorite"] = input.is_favorite
    if input.view_style is not None:
        body["view_style"] = input.view_style

    result = await _make_request("POST", "/projects", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_update_project",
    description="Update an existing project",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def update_project(input: UpdateProjectInput) -> str:
    """
    Update a project's properties.

    Args:
        input: UpdateProjectInput with project_id (required) and fields to update
    """
    body = {}

    if input.name is not None:
        body["name"] = input.name
    if input.description is not None:
        body["description"] = input.description
    if input.color is not None:
        body["color"] = input.color
    if input.is_favorite is not None:
        body["is_favorite"] = input.is_favorite
    if input.view_style is not None:
        body["view_style"] = input.view_style

    result = await _make_request("POST", f"/projects/{input.project_id}", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_delete_project",
    description="Delete a project permanently",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def delete_project(project_id: str) -> str:
    """
    Permanently delete a project and all its tasks.

    This action cannot be undone.

    Args:
        project_id: The ID of the project to delete
    """
    result = await _make_request("DELETE", f"/projects/{project_id}")
    return json.dumps(result)


@mcp.tool(
    name="todoist_archive_project",
    description="Archive a project",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def archive_project(project_id: str) -> str:
    """
    Archive a project (hides it from the project list).

    Args:
        project_id: The ID of the project to archive
    """
    result = await _make_request("POST", f"/projects/{project_id}/archive")
    return json.dumps(result)


@mcp.tool(
    name="todoist_unarchive_project",
    description="Unarchive a project",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def unarchive_project(project_id: str) -> str:
    """
    Unarchive a project (makes it visible again).

    Args:
        project_id: The ID of the project to unarchive
    """
    result = await _make_request("POST", f"/projects/{project_id}/unarchive")
    return json.dumps(result)


# ============================================================================
# WRITE OPERATION TOOLS - SECTIONS
# ============================================================================


@mcp.tool(
    name="todoist_create_section",
    description="Create a new section",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def create_section(input: CreateSectionInput) -> str:
    """
    Create a new section in a project.

    Args:
        input: CreateSectionInput with name and project_id (required)
    """
    body = {"name": input.name, "project_id": input.project_id}

    if input.order is not None:
        body["order"] = input.order

    result = await _make_request("POST", "/sections", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_update_section",
    description="Update a section",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def update_section(input: UpdateSectionInput) -> str:
    """
    Update a section's properties.

    Args:
        input: UpdateSectionInput with section_id (required) and name (optional)
    """
    body = {}

    if input.name is not None:
        body["name"] = input.name

    result = await _make_request("POST", f"/sections/{input.section_id}", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_delete_section",
    description="Delete a section permanently",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def delete_section(section_id: str) -> str:
    """
    Permanently delete a section.

    This action cannot be undone.

    Args:
        section_id: The ID of the section to delete
    """
    result = await _make_request("DELETE", f"/sections/{section_id}")
    return json.dumps(result)


# ============================================================================
# WRITE OPERATION TOOLS - COMMENTS
# ============================================================================


@mcp.tool(
    name="todoist_create_comment",
    description="Create a comment on a task or project",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def create_comment(input: CreateCommentInput) -> str:
    """
    Create a comment. Requires exactly one of task_id or project_id.

    Args:
        input: CreateCommentInput with content (required) and task_id or project_id
    """
    if not input.task_id and not input.project_id:
        raise ValueError("Must provide either task_id or project_id")
    if input.task_id and input.project_id:
        raise ValueError("Provide only one of task_id or project_id")

    body = {"content": input.content}

    if input.task_id is not None:
        body["task_id"] = input.task_id
    if input.project_id is not None:
        body["project_id"] = input.project_id

    result = await _make_request("POST", "/comments", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_update_comment",
    description="Update a comment",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def update_comment(input: UpdateCommentInput) -> str:
    """
    Update a comment's content.

    Args:
        input: UpdateCommentInput with comment_id and new content (required)
    """
    body = {"content": input.content}

    result = await _make_request("POST", f"/comments/{input.comment_id}", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_delete_comment",
    description="Delete a comment permanently",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def delete_comment(comment_id: str) -> str:
    """
    Permanently delete a comment.

    This action cannot be undone.

    Args:
        comment_id: The ID of the comment to delete
    """
    result = await _make_request("DELETE", f"/comments/{comment_id}")
    return json.dumps(result)


# ============================================================================
# WRITE OPERATION TOOLS - LABELS
# ============================================================================


@mcp.tool(
    name="todoist_create_label",
    description="Create a new label",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def create_label(input: CreateLabelInput) -> str:
    """
    Create a new label with optional order and color.

    Args:
        input: CreateLabelInput with name (required)
    """
    body = {"name": input.name}

    if input.order is not None:
        body["order"] = input.order
    if input.color is not None:
        body["color"] = input.color

    result = await _make_request("POST", "/labels", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_update_label",
    description="Update a label",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def update_label(input: UpdateLabelInput) -> str:
    """
    Update a label's properties.

    Args:
        input: UpdateLabelInput with label_id (required) and fields to update
    """
    body = {}

    if input.name is not None:
        body["name"] = input.name
    if input.order is not None:
        body["order"] = input.order
    if input.color is not None:
        body["color"] = input.color

    result = await _make_request("POST", f"/labels/{input.label_id}", json_body=body)
    return json.dumps(result)


@mcp.tool(
    name="todoist_delete_label",
    description="Delete a label permanently",
    annotations={"readOnlyHint": False, "destructiveHint": True, "openWorldHint": True},
)
async def delete_label(label_id: str) -> str:
    """
    Permanently delete a label.

    This action cannot be undone.

    Args:
        label_id: The ID of the label to delete
    """
    result = await _make_request("DELETE", f"/labels/{label_id}")
    return json.dumps(result)


# ============================================================================
# Entry Point
# ============================================================================


if __name__ == "__main__":
    mcp.run(transport="stdio")
