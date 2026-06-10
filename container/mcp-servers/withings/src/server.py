"""Withings MCP Server — exposes health data as MCP tools."""

import asyncio
import os
import time
from datetime import datetime, timedelta

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP

from .withings_client import WithingsClient, MEASURE_TYPES

load_dotenv()

mcp = FastMCP("Withings Health")

_client: WithingsClient | None = None


def _get_client() -> WithingsClient:
    global _client
    if _client is None:
        client_id = os.environ.get("WITHINGS_CLIENT_ID", "")
        client_secret = os.environ.get("WITHINGS_CLIENT_SECRET", "")
        token_path = os.environ.get("WITHINGS_TOKEN_PATH", "~/.withings_tokens.json")
        if not client_id or not client_secret:
            raise Exception(
                "WITHINGS_CLIENT_ID and WITHINGS_CLIENT_SECRET environment variables are required. "
                "Register your app at https://developer.withings.com/dashboard/"
            )
        _client = WithingsClient(client_id, client_secret, token_path)
    return _client


def _days_ago(days: int) -> str:
    return (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")


def _ts_days_ago(days: int) -> int:
    return int((datetime.now() - timedelta(days=days)).timestamp())


def _format_timestamp(ts: int) -> str:
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")


# ── TOOLS ───────────────────────────────────────────────────────


@mcp.tool()
async def get_weight_and_body(days: int = 30) -> str:
    """Get weight and body composition measurements (weight, fat%, muscle mass, bone mass, hydration, BMI, etc.).

    Args:
        days: Number of days to look back (default 30)
    """
    client = _get_client()
    data = await client.get_measurements(
        startdate=_ts_days_ago(days),
        enddate=int(time.time()),
        meastypes="1,5,6,8,76,77,88,91,168",
    )
    if not data:
        return f"No body measurements found in the last {days} days."

    lines = [f"📊 Body measurements — last {days} days:\n"]
    for entry in sorted(data, key=lambda x: x["date"], reverse=True):
        date_str = _format_timestamp(entry["date"])
        measures = entry["measures"]
        parts = []
        for name, val in measures.items():
            display = name.replace("_", " ").replace(" kg", "").replace(" pct", "%")
            if "kg" in name:
                parts.append(f"{display}: {val:.1f} kg")
            elif "pct" in name:
                parts.append(f"{display}: {val:.1f}%")
            else:
                parts.append(f"{display}: {val}")
        lines.append(f"  {date_str} — {', '.join(parts)}")

    return "\n".join(lines)


@mcp.tool()
async def get_all_measurements(days: int = 30, measure_types: str | None = None) -> str:
    """Get any type of Withings measurement (weight, blood pressure, heart rate, temperature, SpO2, etc.).

    Args:
        days: Number of days to look back (default 30)
        measure_types: Comma-separated measure type IDs (optional). Common types:
            1=weight, 6=fat%, 8=fat_mass, 76=muscle, 88=bone, 77=hydration,
            9=diastolic_bp, 10=systolic_bp, 11=heart_rate, 12=temperature,
            54=spo2, 91=pulse_wave_velocity, 123=vo2max
    """
    client = _get_client()
    data = await client.get_measurements(
        startdate=_ts_days_ago(days),
        enddate=int(time.time()),
        meastypes=measure_types,
    )
    if not data:
        return f"No measurements found in the last {days} days."

    lines = [f"📏 All measurements — last {days} days:\n"]
    for entry in sorted(data, key=lambda x: x["date"], reverse=True):
        date_str = _format_timestamp(entry["date"])
        parts = [f"{k}: {v}" for k, v in entry["measures"].items()]
        lines.append(f"  {date_str} — {', '.join(parts)}")

    return "\n".join(lines)


@mcp.tool()
async def get_activity(days: int = 7) -> str:
    """Get daily activity data (steps, distance, calories, active minutes, heart rate zones).

    Args:
        days: Number of days to look back (default 7)
    """
    client = _get_client()
    data = await client.get_activity(
        startdateymd=_days_ago(days),
        enddateymd=datetime.now().strftime("%Y-%m-%d"),
    )
    if not data:
        return f"No activity data found in the last {days} days."

    lines = [f"🏃 Daily activity — last {days} days:\n"]
    for day in sorted(data, key=lambda x: x.get("date", ""), reverse=True):
        date = day.get("date", "?")
        steps = day.get("steps", 0)
        dist = day.get("distance", 0)
        cals = day.get("calories", 0)
        total_cals = day.get("totalcalories", 0)
        soft = day.get("soft", 0)
        moderate = day.get("moderate", 0)
        intense = day.get("intense", 0)
        hr_avg = day.get("hr_average", "—")

        lines.append(
            f"  {date}: {steps:,} steps, {dist:.0f}m, "
            f"{cals:.0f} active cal ({total_cals:.0f} total), "
            f"soft {soft}min / moderate {moderate}min / intense {intense}min, "
            f"avg HR {hr_avg}"
        )

    return "\n".join(lines)


def _fmt_duration(secs) -> str:
    """Format seconds as Xh XXm."""
    if secs is None:
        return "—"
    m = int(secs) // 60
    return f"{m // 60}h{m % 60:02d}m"


# Sleep state mapping for detailed sleep data
SLEEP_STATES = {0: "awake", 1: "light", 2: "deep", 3: "REM"}


@mcp.tool()
async def get_sleep(days: int = 7) -> str:
    """Get sleep summary data (duration, sleep score, deep/light/REM stages, HR, breathing, snoring, apnea index).

    Args:
        days: Number of days to look back (default 7)
    """
    client = _get_client()
    data = await client.get_sleep_summary(
        startdateymd=_days_ago(days),
        enddateymd=datetime.now().strftime("%Y-%m-%d"),
    )
    if not data:
        return f"No sleep data found in the last {days} days."

    lines = [f"😴 Sleep summary — last {days} days:\n"]
    for night in sorted(data, key=lambda x: x.get("date", ""), reverse=True):
        date = night.get("date", night.get("startdate", "?"))
        d = night.get("data", night)

        start_ts = night.get("startdate")
        end_ts = night.get("enddate")
        time_range = ""
        if isinstance(start_ts, int) and isinstance(end_ts, int):
            time_range = f" ({_format_timestamp(start_ts).split(' ')[1]} → {_format_timestamp(end_ts).split(' ')[1]})"

        total = d.get("total_sleep_time")
        bed = d.get("total_timeinbed")
        deep = d.get("deepsleepduration")
        light = d.get("lightsleepduration")
        rem = d.get("remsleepduration")
        score = d.get("sleep_score")
        efficiency = d.get("sleep_efficiency")
        latency = d.get("sleep_latency")
        hr_avg = d.get("hr_average")
        hr_min = d.get("hr_min")
        hr_max = d.get("hr_max")
        rr_avg = d.get("rr_average")
        rr_min = d.get("rr_min")
        rr_max = d.get("rr_max")
        wakeups = d.get("wakeupcount")
        wake_dur = d.get("wakeupduration")
        snoring = d.get("snoring")
        snoring_ep = d.get("snoringepisodecount")
        apnea = d.get("apnea_hypopnea_index")
        out_of_bed = d.get("out_of_bed_count")
        breathing = d.get("breathing_disturbances_intensity")

        lines.append(f"  📅 {date}{time_range}")
        if score is not None:
            lines.append(f"     Sleep score: {score}/100")

        # Duration breakdown
        dur_parts = [f"total {_fmt_duration(total)}"]
        if bed is not None:
            dur_parts.append(f"in bed {_fmt_duration(bed)}")
        lines.append(f"     Duration: {', '.join(dur_parts)}")

        # Stages
        stage_parts = []
        if deep is not None:
            stage_parts.append(f"deep {_fmt_duration(deep)}")
        if light is not None:
            stage_parts.append(f"light {_fmt_duration(light)}")
        if rem is not None:
            stage_parts.append(f"REM {_fmt_duration(rem)}")
        if stage_parts:
            lines.append(f"     Stages: {', '.join(stage_parts)}")

        # Efficiency & latency
        eff_parts = []
        if efficiency is not None:
            eff_parts.append(f"efficiency {efficiency:.0%}")
        if latency is not None:
            eff_parts.append(f"fell asleep in {_fmt_duration(latency)}")
        if eff_parts:
            lines.append(f"     Quality: {', '.join(eff_parts)}")

        # Heart rate
        if hr_avg is not None:
            hr_str = f"avg {hr_avg}"
            if hr_min is not None and hr_max is not None:
                hr_str += f" (min {hr_min}, max {hr_max})"
            lines.append(f"     Heart rate: {hr_str} bpm")

        # Breathing
        if rr_avg is not None:
            rr_str = f"avg {rr_avg}"
            if rr_min is not None and rr_max is not None:
                rr_str += f" (min {rr_min}, max {rr_max})"
            lines.append(f"     Breathing: {rr_str} br/min")

        # Disruptions
        dis_parts = []
        if wakeups is not None:
            wake_str = f"{wakeups} wakeups"
            if wake_dur is not None:
                wake_str += f" ({_fmt_duration(wake_dur)} awake)"
            dis_parts.append(wake_str)
        if out_of_bed is not None and out_of_bed > 0:
            dis_parts.append(f"{out_of_bed}x out of bed")
        if dis_parts:
            lines.append(f"     Disruptions: {', '.join(dis_parts)}")

        # Snoring & apnea
        snore_parts = []
        if snoring is not None:
            snore_parts.append(f"snoring {_fmt_duration(snoring)}")
        if snoring_ep is not None:
            snore_parts.append(f"{snoring_ep} episodes")
        if apnea is not None:
            snore_parts.append(f"AHI {apnea:.1f}")
        if breathing is not None:
            snore_parts.append(f"breathing disturbance {breathing}")
        if snore_parts:
            lines.append(f"     Snoring/Apnea: {', '.join(snore_parts)}")

        lines.append("")  # blank line between nights

    return "\n".join(lines)


@mcp.tool()
async def get_sleep_details(days: int = 1) -> str:
    """Get detailed sleep data with per-minute heart rate, breathing rate, snoring, and sleep stages.
    Returns time-series data for the sleep period(s) in the given range.

    Args:
        days: Number of days to look back (default 1, i.e. last night)
    """
    client = _get_client()
    start_ts = _ts_days_ago(days)
    end_ts = int(time.time())
    data = await client.get_sleep_details(startdate=start_ts, enddate=end_ts)

    series = data.get("series", [])
    if not series:
        return f"No detailed sleep data found in the last {days} day(s)."

    lines = [f"🔬 Detailed sleep data — last {days} day(s):\n"]

    # Group segments by night (by date of startdate)
    nights: dict[str, list] = {}
    for seg in series:
        dt = datetime.fromtimestamp(seg["startdate"])
        # Night = use date of wake-up if after midnight, else current date
        night_date = dt.strftime("%Y-%m-%d")
        if dt.hour < 12:
            night_date = (dt - timedelta(days=1)).strftime("%Y-%m-%d")
        nights.setdefault(night_date, []).append(seg)

    for night_date in sorted(nights.keys(), reverse=True):
        segments = sorted(nights[night_date], key=lambda s: s["startdate"])
        lines.append(f"  📅 Night of {night_date}")

        # Collect all HR, RR, snoring values across the night
        all_hr = []
        all_rr = []
        total_snoring_secs = 0
        stage_durations = {0: 0, 1: 0, 2: 0, 3: 0}

        for seg in segments:
            state = seg.get("state", -1)
            duration = seg.get("enddate", 0) - seg.get("startdate", 0)
            if state in stage_durations:
                stage_durations[state] += duration

            # HR values
            hr_data = seg.get("hr", {})
            if isinstance(hr_data, dict):
                all_hr.extend(hr_data.values())

            # RR values
            rr_data = seg.get("rr", {})
            if isinstance(rr_data, dict):
                all_rr.extend(rr_data.values())

            # Snoring
            snoring_data = seg.get("snoring", {})
            if isinstance(snoring_data, dict):
                total_snoring_secs += sum(1 for v in snoring_data.values() if v and v > 0) * 60

        # Time range
        if segments:
            first_start = _format_timestamp(segments[0]["startdate"])
            last_end = _format_timestamp(segments[-1].get("enddate", segments[-1]["startdate"]))
            lines.append(f"     Time: {first_start} → {last_end}")

        # Stage summary from detailed data
        stage_parts = []
        for state_id, label in SLEEP_STATES.items():
            if stage_durations[state_id] > 0:
                stage_parts.append(f"{label} {_fmt_duration(stage_durations[state_id])}")
        if stage_parts:
            lines.append(f"     Stages: {', '.join(stage_parts)}")

        # HR stats
        if all_hr:
            hr_vals = [v for v in all_hr if isinstance(v, (int, float)) and v > 0]
            if hr_vals:
                lines.append(
                    f"     Heart rate: avg {sum(hr_vals)/len(hr_vals):.0f}, "
                    f"min {min(hr_vals)}, max {max(hr_vals)} bpm "
                    f"({len(hr_vals)} measurements)"
                )

        # RR stats
        if all_rr:
            rr_vals = [v for v in all_rr if isinstance(v, (int, float)) and v > 0]
            if rr_vals:
                lines.append(
                    f"     Breathing: avg {sum(rr_vals)/len(rr_vals):.0f}, "
                    f"min {min(rr_vals)}, max {max(rr_vals)} br/min "
                    f"({len(rr_vals)} measurements)"
                )

        # Snoring
        if total_snoring_secs > 0:
            lines.append(f"     Snoring detected: ~{_fmt_duration(total_snoring_secs)}")

        # Detailed timeline (condensed — show stage transitions)
        lines.append(f"     Timeline ({len(segments)} segments):")
        prev_state = None
        block_start = None
        for seg in segments:
            state = seg.get("state", -1)
            if state != prev_state:
                if prev_state is not None and block_start is not None:
                    block_end = _format_timestamp(seg["startdate"]).split(" ")[1]
                    label = SLEEP_STATES.get(prev_state, f"state_{prev_state}")
                    lines.append(f"       {_format_timestamp(block_start).split(' ')[1]} → {block_end}: {label}")
                block_start = seg["startdate"]
                prev_state = state
        # Last block
        if prev_state is not None and block_start is not None and segments:
            block_end = _format_timestamp(segments[-1].get("enddate", segments[-1]["startdate"])).split(" ")[1]
            label = SLEEP_STATES.get(prev_state, f"state_{prev_state}")
            lines.append(f"       {_format_timestamp(block_start).split(' ')[1]} → {block_end}: {label}")

        lines.append("")

    return "\n".join(lines)


@mcp.tool()
async def get_workouts(days: int = 30) -> str:
    """Get workout/exercise data (duration, calories, heart rate, steps, distance).

    Args:
        days: Number of days to look back (default 30)
    """
    client = _get_client()
    data = await client.get_workouts(
        startdateymd=_days_ago(days),
        enddateymd=datetime.now().strftime("%Y-%m-%d"),
    )
    if not data:
        return f"No workouts found in the last {days} days."

    lines = [f"💪 Workouts — last {days} days:\n"]
    for w in sorted(data, key=lambda x: x.get("startdate", 0), reverse=True):
        start = w.get("startdate", "?")
        end = w.get("enddate", "?")
        cat = w.get("category", "?")
        d = w.get("data", w)
        cals = d.get("calories", "—")
        dur = d.get("effduration")
        hr_avg = d.get("hr_average", "—")
        steps = d.get("steps", "—")
        dist = d.get("distance", "—")

        dur_str = f"{int(dur) // 60}min" if dur else "—"
        if isinstance(start, int):
            start = _format_timestamp(start)
        if isinstance(end, int):
            end = _format_timestamp(end)

        lines.append(
            f"  {start}: category {cat}, {dur_str}, "
            f"{cals} cal, HR avg {hr_avg}, {steps} steps, {dist}m distance"
        )

    return "\n".join(lines)


@mcp.tool()
async def get_heart_records(days: int = 30) -> str:
    """Get heart/ECG recording list.

    Args:
        days: Number of days to look back (default 30)
    """
    client = _get_client()
    data = await client.get_heart_list(
        startdate=_ts_days_ago(days),
        enddate=int(time.time()),
    )
    if not data:
        return f"No heart recordings found in the last {days} days."

    lines = [f"❤️ Heart recordings — last {days} days:\n"]
    for rec in data:
        ts = rec.get("timestamp", rec.get("created", "?"))
        if isinstance(ts, int):
            ts = _format_timestamp(ts)
        model = rec.get("model", "—")
        ecg = rec.get("ecg", {})
        afib = ecg.get("afib", "—") if isinstance(ecg, dict) else "—"
        hr = rec.get("heart_rate", ecg.get("hr", "—") if isinstance(ecg, dict) else "—")
        lines.append(f"  {ts}: HR {hr} bpm, AFib: {afib}, model: {model}")

    return "\n".join(lines)


@mcp.tool()
async def get_devices() -> str:
    """List all connected Withings devices."""
    client = _get_client()
    devices = await client.get_user_devices()
    if not devices:
        return "No devices found."

    lines = ["📱 Connected Withings devices:\n"]
    for d in devices:
        model = d.get("model", "?")
        model_id = d.get("model_id", "?")
        battery = d.get("battery", "?")
        device_type = d.get("type", "?")
        fw = d.get("fw", "?")
        last_session = d.get("last_session_date")
        if isinstance(last_session, int):
            last_session = _format_timestamp(last_session)
        lines.append(
            f"  {model} (id: {model_id}, type: {device_type}) — "
            f"battery: {battery}, fw: {fw}, last session: {last_session}"
        )

    return "\n".join(lines)


@mcp.tool()
async def get_weight_trend(days: int = 90) -> str:
    """Get weight trend with weekly averages for tracking progress over time.

    Args:
        days: Number of days to analyze (default 90)
    """
    client = _get_client()
    data = await client.get_measurements(
        startdate=_ts_days_ago(days),
        enddate=int(time.time()),
        meastypes="1,6,76",  # weight, fat%, muscle
    )
    if not data:
        return f"No weight data found in the last {days} days."

    # Group by week
    weeks: dict[str, list] = {}
    for entry in data:
        dt = datetime.fromtimestamp(entry["date"])
        week_start = (dt - timedelta(days=dt.weekday())).strftime("%Y-%m-%d")
        weeks.setdefault(week_start, []).append(entry["measures"])

    lines = [f"📈 Weight trend — last {days} days (weekly averages):\n"]
    for week, measures_list in sorted(weeks.items()):
        weight_vals = [m.get("weight_kg", 0) for m in measures_list if "weight_kg" in m]
        fat_vals = [m.get("fat_ratio_pct", 0) for m in measures_list if "fat_ratio_pct" in m]
        muscle_vals = [m.get("muscle_mass_kg", 0) for m in measures_list if "muscle_mass_kg" in m]

        parts = [f"Week of {week}:"]
        if weight_vals:
            parts.append(f"weight {sum(weight_vals)/len(weight_vals):.1f} kg")
        if fat_vals:
            parts.append(f"fat {sum(fat_vals)/len(fat_vals):.1f}%")
        if muscle_vals:
            parts.append(f"muscle {sum(muscle_vals)/len(muscle_vals):.1f} kg")
        parts.append(f"({len(measures_list)} measurements)")
        lines.append(f"  {', '.join(parts)}")

    # Overall change
    all_weights = []
    for entry in sorted(data, key=lambda x: x["date"]):
        w = entry["measures"].get("weight_kg")
        if w:
            all_weights.append((entry["date"], w))
    if len(all_weights) >= 2:
        first = all_weights[0][1]
        last = all_weights[-1][1]
        diff = last - first
        lines.append(f"\n  Change: {first:.1f} → {last:.1f} kg ({diff:+.1f} kg)")

    return "\n".join(lines)


def main():
    """Run the MCP server."""
    mcp.run()


if __name__ == "__main__":
    main()
