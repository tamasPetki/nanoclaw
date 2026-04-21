"""Withings API client with OAuth2 token management."""

import json
import time
from pathlib import Path
from typing import Any

import httpx

API_BASE = "https://wbsapi.withings.net"
AUTH_URL = "https://account.withings.com/oauth2_user/authorize2"
TOKEN_URL = f"{API_BASE}/v2/oauth2"

# Measure type mappings
MEASURE_TYPES = {
    1: "weight_kg",
    4: "height_m",
    5: "fat_free_mass_kg",
    6: "fat_ratio_pct",
    8: "fat_mass_weight_kg",
    9: "diastolic_bp_mmhg",
    10: "systolic_bp_mmhg",
    11: "heart_pulse_bpm",
    12: "temperature_c",
    54: "spo2_pct",
    71: "body_temperature_c",
    73: "skin_temperature_c",
    76: "muscle_mass_kg",
    77: "hydration_kg",
    88: "bone_mass_kg",
    91: "pulse_wave_velocity_ms",
    123: "vo2max",
    135: "qrs_interval",
    136: "pr_interval",
    137: "qt_interval",
    138: "corrected_qt_interval",
    139: "afib_result",
    155: "vascular_age",
    168: "visceral_fat_index",
    169: "nerve_health_left_feet",
    170: "nerve_health_right_feet",
    174: "electrodermal_activity",
}


class WithingsClient:
    """Withings API client with automatic token refresh."""

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        token_path: str = "~/.withings_tokens.json",
    ):
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_path = Path(token_path).expanduser()
        self.tokens: dict[str, Any] = {}
        self._load_tokens()

    def _load_tokens(self) -> None:
        if self.token_path.exists():
            self.tokens = json.loads(self.token_path.read_text())

    def _save_tokens(self) -> None:
        self.token_path.write_text(json.dumps(self.tokens, indent=2))

    @property
    def is_authenticated(self) -> bool:
        return bool(self.tokens.get("access_token"))

    def get_auth_url(self, callback_uri: str = "http://localhost:8585/callback") -> str:
        """Generate the OAuth2 authorization URL."""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": callback_uri,
            "scope": "user.info,user.metrics,user.activity,user.sleepevents",
            "state": "withings_mcp",
        }
        qs = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{AUTH_URL}?{qs}"

    async def exchange_code(
        self, code: str, callback_uri: str = "http://localhost:8585/callback"
    ) -> dict:
        """Exchange authorization code for tokens."""
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                TOKEN_URL,
                data={
                    "action": "requesttoken",
                    "grant_type": "authorization_code",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": callback_uri,
                },
            )
            data = resp.json()
            if data.get("status") != 0:
                raise Exception(f"Token exchange failed: {data}")
            body = data["body"]
            self.tokens = {
                "access_token": body["access_token"],
                "refresh_token": body["refresh_token"],
                "expires_at": time.time() + body["expires_in"],
                "userid": body["userid"],
            }
            self._save_tokens()
            return self.tokens

    async def _refresh_token(self) -> None:
        """Refresh the access token."""
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                TOKEN_URL,
                data={
                    "action": "requesttoken",
                    "grant_type": "refresh_token",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "refresh_token": self.tokens["refresh_token"],
                },
            )
            data = resp.json()
            if data.get("status") != 0:
                raise Exception(
                    f"Token refresh failed (status {data.get('status')}): {data}. "
                    "You may need to re-authenticate: run `withings-auth`"
                )
            body = data["body"]
            self.tokens["access_token"] = body["access_token"]
            self.tokens["refresh_token"] = body["refresh_token"]
            self.tokens["expires_at"] = time.time() + body["expires_in"]
            self._save_tokens()

    async def _ensure_token(self) -> str:
        """Get a valid access token, refreshing if needed."""
        if not self.is_authenticated:
            raise Exception(
                "Not authenticated. Run `withings-auth` first to set up OAuth."
            )
        if time.time() >= self.tokens.get("expires_at", 0) - 60:
            await self._refresh_token()
        return self.tokens["access_token"]

    async def api_call(
        self, url: str, action: str, **params: Any
    ) -> dict:
        """Make an authenticated API call."""
        token = await self._ensure_token()
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                url,
                headers={"Authorization": f"Bearer {token}"},
                data={"action": action, **params},
            )
            data = resp.json()
            if data.get("status") != 0:
                raise Exception(f"API error (status {data.get('status')}): {data}")
            return data.get("body", {})

    # ── High-level methods ────────────────────────────────────

    async def get_measurements(
        self,
        startdate: int | None = None,
        enddate: int | None = None,
        lastupdate: int | None = None,
        meastypes: str | None = None,
        category: int = 1,
    ) -> list[dict]:
        """Get body measurements (weight, fat, muscle, etc.)."""
        params: dict[str, Any] = {"category": category}
        if startdate:
            params["startdate"] = startdate
        if enddate:
            params["enddate"] = enddate
        if lastupdate:
            params["lastupdate"] = lastupdate
        if meastypes:
            params["meastypes"] = meastypes

        body = await self.api_call(f"{API_BASE}/measure", "getmeas", **params)
        results = []
        for grp in body.get("measuregrps", []):
            entry = {
                "date": grp["date"],
                "created": grp.get("created"),
                "deviceid": grp.get("deviceid"),
                "measures": {},
            }
            for m in grp.get("measures", []):
                type_id = m["type"]
                value = m["value"] * (10 ** m["unit"])
                name = MEASURE_TYPES.get(type_id, f"type_{type_id}")
                entry["measures"][name] = round(value, 4)
            results.append(entry)
        return results

    async def get_activity(
        self,
        startdateymd: str | None = None,
        enddateymd: str | None = None,
        lastupdate: int | None = None,
        data_fields: str = "steps,distance,elevation,soft,moderate,intense,active,calories,totalcalories,hr_average,hr_min,hr_max,hr_zone_0,hr_zone_1,hr_zone_2,hr_zone_3",
    ) -> list[dict]:
        """Get daily activity data."""
        params: dict[str, Any] = {"data_fields": data_fields}
        if startdateymd:
            params["startdateymd"] = startdateymd
        if enddateymd:
            params["enddateymd"] = enddateymd
        if lastupdate:
            params["lastupdate"] = lastupdate
        body = await self.api_call(
            f"{API_BASE}/v2/measure", "getactivity", **params
        )
        return body.get("activities", [])

    async def get_sleep_summary(
        self,
        startdateymd: str | None = None,
        enddateymd: str | None = None,
        lastupdate: int | None = None,
        data_fields: str = "nb_rem_episodes,sleep_efficiency,sleep_latency,total_sleep_time,total_timeinbed,wakeup_latency,waso,apnea_hypopnea_index,breathing_disturbances_intensity,deepsleepduration,durationtosleep,durationtowakeup,hr_average,hr_max,hr_min,lightsleepduration,nb_rem_episodes,night_events,out_of_bed_count,remsleepduration,rr_average,rr_max,rr_min,sleep_score,snoring,snoringepisodecount,wakeupcount,wakeupduration",
    ) -> list[dict]:
        """Get sleep summary data."""
        params: dict[str, Any] = {"data_fields": data_fields}
        if startdateymd:
            params["startdateymd"] = startdateymd
        if enddateymd:
            params["enddateymd"] = enddateymd
        if lastupdate:
            params["lastupdate"] = lastupdate
        body = await self.api_call(
            f"{API_BASE}/v2/sleep", "getsummary", **params
        )
        return body.get("series", [])

    async def get_sleep_details(
        self,
        startdate: int | None = None,
        enddate: int | None = None,
        data_fields: str = "hr,rr,snoring,sdnn_1,rmssd",
    ) -> dict:
        """Get detailed sleep data (HR, breathing, etc.)."""
        params: dict[str, Any] = {"data_fields": data_fields}
        if startdate:
            params["startdate"] = startdate
        if enddate:
            params["enddate"] = enddate
        return await self.api_call(f"{API_BASE}/v2/sleep", "get", **params)

    async def get_workouts(
        self,
        startdateymd: str | None = None,
        enddateymd: str | None = None,
        lastupdate: int | None = None,
        data_fields: str = "calories,effduration,intensity,manual_distance,manual_calories,hr_average,hr_min,hr_max,hr_zone_0,hr_zone_1,hr_zone_2,hr_zone_3,pause_duration,algoPrecision,spo2_average,steps,distance,elevation",
    ) -> list[dict]:
        """Get workout data."""
        params: dict[str, Any] = {"data_fields": data_fields}
        if startdateymd:
            params["startdateymd"] = startdateymd
        if enddateymd:
            params["enddateymd"] = enddateymd
        if lastupdate:
            params["lastupdate"] = lastupdate
        body = await self.api_call(
            f"{API_BASE}/v2/measure", "getworkouts", **params
        )
        return body.get("series", [])

    async def get_heart_list(
        self,
        startdate: int | None = None,
        enddate: int | None = None,
    ) -> list[dict]:
        """List heart/ECG recordings."""
        params: dict[str, Any] = {}
        if startdate:
            params["startdate"] = startdate
        if enddate:
            params["enddate"] = enddate
        body = await self.api_call(f"{API_BASE}/v2/heart", "list", **params)
        return body.get("series", [])

    async def get_user_devices(self) -> list[dict]:
        """Get list of connected Withings devices."""
        body = await self.api_call(f"{API_BASE}/v2/user", "getdevice")
        return body.get("devices", [])
