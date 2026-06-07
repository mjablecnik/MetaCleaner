#!/usr/bin/env python3
"""
Metadata scanner for image files (JPEG, PNG).
Detects and displays detailed EXIF, IPTC, XMP, comments and other metadata.
Includes AI-generated image detection heuristics.

Usage:
    python check_metadata.py <file_or_directory> [file_or_directory ...]

Examples:
    python check_metadata.py image.jpg
    python check_metadata.py ./images/
    python check_metadata.py photo1.jpg photo2.png ./folder/
"""

import struct
import os
import sys


# EXIF tag definitions
EXIF_TAGS = {
    0x010F: "Make",
    0x0110: "Model",
    0x0112: "Orientation",
    0x011A: "XResolution",
    0x011B: "YResolution",
    0x0128: "ResolutionUnit",
    0x0131: "Software",
    0x0132: "DateTime",
    0x013B: "Artist",
    0x8298: "Copyright",
    0x8769: "ExifIFDPointer",
    0x8825: "GPSInfoIFDPointer",
    # Exif sub-IFD tags
    0x829A: "ExposureTime",
    0x829D: "FNumber",
    0x8827: "ISOSpeedRatings",
    0x9000: "ExifVersion",
    0x9003: "DateTimeOriginal",
    0x9004: "DateTimeDigitized",
    0x9204: "ExposureBiasValue",
    0x9207: "MeteringMode",
    0x9209: "Flash",
    0x920A: "FocalLength",
    0x927C: "MakerNote",
    0x9286: "UserComment",
    0xA001: "ColorSpace",
    0xA002: "PixelXDimension",
    0xA003: "PixelYDimension",
    0xA300: "FileSource",
    0xA301: "SceneType",
    0xA404: "DigitalZoomRatio",
    0xA405: "FocalLengthIn35mmFilm",
    0xA406: "SceneCaptureType",
    0xA420: "ImageUniqueID",
    0xA430: "CameraOwnerName",
    0xA431: "BodySerialNumber",
    0xA432: "LensInfo",
    0xA433: "LensMake",
    0xA434: "LensModel",
    0xA435: "LensSerialNumber",
}

GPS_TAGS = {
    0x0000: "GPSVersionID",
    0x0001: "GPSLatitudeRef",
    0x0002: "GPSLatitude",
    0x0003: "GPSLongitudeRef",
    0x0004: "GPSLongitude",
    0x0005: "GPSAltitudeRef",
    0x0006: "GPSAltitude",
    0x0007: "GPSTimeStamp",
    0x0008: "GPSSatellites",
    0x0009: "GPSStatus",
    0x000A: "GPSMeasureMode",
    0x000B: "GPSDOP",
    0x000C: "GPSSpeedRef",
    0x000D: "GPSSpeed",
    0x0012: "GPSMapDatum",
    0x001D: "GPSDateStamp",
}

# EXIF type sizes
EXIF_TYPES = {
    1: (1, "BYTE"),
    2: (1, "ASCII"),
    3: (2, "SHORT"),
    4: (4, "LONG"),
    5: (8, "RATIONAL"),
    7: (1, "UNDEFINED"),
    9: (4, "SLONG"),
    10: (8, "SRATIONAL"),
}

# Known AI generator signatures in metadata
AI_GENERATOR_SIGNATURES = {
    # Stable Diffusion / AUTOMATIC1111 / ComfyUI
    "parameters": "Stable Diffusion (AUTOMATIC1111)",
    "prompt": "Stable Diffusion / ComfyUI",
    "workflow": "ComfyUI",
    "sd-metadata": "Stable Diffusion",
    "Dream": "Stable Diffusion (Dream)",
    "invokeai_metadata": "InvokeAI",
    # Midjourney
    "midjourney": "Midjourney",
    # NovelAI
    "novelai": "NovelAI",
    "Source": "NovelAI",  # NovelAI uses "Source: Stable Diffusion" or similar
    # Adobe
    "ai:generatedBy": "Adobe Firefly",
    "xmp:CreatorTool": None,  # checked separately for known AI tools
}

AI_SOFTWARE_NAMES = [
    "stable diffusion",
    "automatic1111",
    "comfyui",
    "invokeai",
    "midjourney",
    "dall-e",
    "dalle",
    "novelai",
    "adobe firefly",
    "dreamstudio",
    "leonardo.ai",
    "playground ai",
    "ideogram",
    "flux",
    "openai",
    "chatgpt",
    "bing image creator",
    "copilot",
    "craiyon",
    "nightcafe",
    "artbreeder",
    "deepai",
]


def read_exif_value(data: bytes, offset: int, type_id: int, count: int, byte_order: str):
    """Read an EXIF tag value from the data."""
    type_info = EXIF_TYPES.get(type_id)
    if not type_info:
        return f"<unknown type {type_id}>"

    bytes_per, type_name = type_info
    total_bytes = bytes_per * count

    if total_bytes <= 4:
        value_data = data[offset : offset + 4]
    else:
        value_offset = struct.unpack(f"{byte_order}I", data[offset : offset + 4])[0]
        value_data = data[value_offset : value_offset + total_bytes]

    try:
        if type_id == 2:  # ASCII
            return value_data[:total_bytes].decode("ascii", errors="replace").rstrip("\x00")
        elif type_id == 3:  # SHORT
            values = struct.unpack(f"{byte_order}{count}H", value_data[: count * 2])
            return values[0] if count == 1 else values
        elif type_id == 4:  # LONG
            values = struct.unpack(f"{byte_order}{count}I", value_data[: count * 4])
            return values[0] if count == 1 else values
        elif type_id == 5:  # RATIONAL
            values = []
            for i in range(count):
                num = struct.unpack(f"{byte_order}I", value_data[i * 8 : i * 8 + 4])[0]
                den = struct.unpack(f"{byte_order}I", value_data[i * 8 + 4 : i * 8 + 8])[0]
                values.append(num / den if den != 0 else 0)
            return values[0] if count == 1 else values
        elif type_id == 10:  # SRATIONAL
            values = []
            for i in range(count):
                num = struct.unpack(f"{byte_order}i", value_data[i * 8 : i * 8 + 4])[0]
                den = struct.unpack(f"{byte_order}i", value_data[i * 8 + 4 : i * 8 + 8])[0]
                values.append(num / den if den != 0 else 0)
            return values[0] if count == 1 else values
        elif type_id == 1:  # BYTE
            return value_data[0] if count == 1 else list(value_data[:count])
        elif type_id == 7:  # UNDEFINED
            if count <= 8:
                return value_data[:count].hex()
            return f"<{count} bytes>"
        elif type_id == 9:  # SLONG
            values = struct.unpack(f"{byte_order}{count}i", value_data[: count * 4])
            return values[0] if count == 1 else values
    except (struct.error, IndexError):
        return "<error reading value>"

    return f"<type {type_id}, count {count}>"


def parse_ifd(data: bytes, ifd_offset: int, byte_order: str, tag_dict: dict) -> dict:
    """Parse an IFD and return tag values."""
    tags = {}
    try:
        num_entries = struct.unpack(f"{byte_order}H", data[ifd_offset : ifd_offset + 2])[0]
    except struct.error:
        return tags

    for i in range(num_entries):
        entry_offset = ifd_offset + 2 + i * 12
        if entry_offset + 12 > len(data):
            break

        try:
            tag_id = struct.unpack(f"{byte_order}H", data[entry_offset : entry_offset + 2])[0]
            type_id = struct.unpack(f"{byte_order}H", data[entry_offset + 2 : entry_offset + 4])[0]
            count = struct.unpack(f"{byte_order}I", data[entry_offset + 4 : entry_offset + 8])[0]
        except struct.error:
            continue

        tag_name = tag_dict.get(tag_id, f"Tag(0x{tag_id:04X})")
        value = read_exif_value(data, entry_offset + 8, type_id, count, byte_order)
        tags[tag_name] = value

    return tags


def parse_exif(exif_data: bytes) -> dict:
    """Parse EXIF data and return structured metadata."""
    result = {"IFD0": {}, "ExifSubIFD": {}, "GPS": {}}

    if exif_data[:4] == b"Exif":
        exif_data = exif_data[6:]

    if exif_data[:2] == b"MM":
        byte_order = ">"
    elif exif_data[:2] == b"II":
        byte_order = "<"
    else:
        return result

    try:
        magic = struct.unpack(f"{byte_order}H", exif_data[2:4])[0]
        if magic != 42:
            return result
        ifd0_offset = struct.unpack(f"{byte_order}I", exif_data[4:8])[0]
    except struct.error:
        return result

    result["IFD0"] = parse_ifd(exif_data, ifd0_offset, byte_order, EXIF_TAGS)

    exif_ifd_offset = result["IFD0"].get("ExifIFDPointer")
    if isinstance(exif_ifd_offset, int):
        result["ExifSubIFD"] = parse_ifd(exif_data, exif_ifd_offset, byte_order, EXIF_TAGS)

    gps_ifd_offset = result["IFD0"].get("GPSInfoIFDPointer")
    if isinstance(gps_ifd_offset, int):
        result["GPS"] = parse_ifd(exif_data, gps_ifd_offset, byte_order, GPS_TAGS)

    return result


def format_gps_coordinate(values, ref: str) -> str:
    """Format GPS coordinates as human-readable string."""
    if isinstance(values, (list, tuple)) and len(values) >= 3:
        degrees, minutes, seconds = values[0], values[1], values[2]
        decimal = degrees + minutes / 60 + seconds / 3600
        if ref in ("S", "W"):
            decimal = -decimal
        return f"{degrees}\u00b0{minutes}'{seconds:.2f}\"{ref} ({decimal:.6f}\u00b0)"
    return str(values)


def format_exif_results(exif_data: dict) -> list[str]:
    """Format parsed EXIF data into readable lines."""
    lines = []

    ifd0 = exif_data.get("IFD0", {})
    interesting_ifd0 = {k: v for k, v in ifd0.items() if k not in ("ExifIFDPointer", "GPSInfoIFDPointer")}
    if interesting_ifd0:
        lines.append("  \U0001f4f7 Camera / Image Info:")
        for tag, value in interesting_ifd0.items():
            lines.append(f"     {tag}: {value}")

    exif_sub = exif_data.get("ExifSubIFD", {})
    if exif_sub:
        lines.append("  \U0001f527 EXIF Details:")
        for tag, value in exif_sub.items():
            if tag == "MakerNote":
                lines.append(f"     {tag}: <manufacturer-specific data>")
            elif tag == "UserComment":
                if isinstance(value, str) and len(value) > 200:
                    lines.append(f"     {tag}: {value[:200]}... ({len(value)} chars)")
                else:
                    lines.append(f"     {tag}: {value}")
            elif tag == "ExposureTime" and isinstance(value, float):
                if value < 1:
                    lines.append(f"     {tag}: 1/{int(1/value)}s")
                else:
                    lines.append(f"     {tag}: {value}s")
            elif tag == "FNumber" and isinstance(value, float):
                lines.append(f"     {tag}: f/{value:.1f}")
            elif tag == "FocalLength" and isinstance(value, float):
                lines.append(f"     {tag}: {value:.1f}mm")
            elif tag == "FileSource":
                source_names = {1: "Film scanner", 2: "Reflection print scanner", 3: "Digital camera"}
                name = source_names.get(value, f"Unknown ({value})")
                lines.append(f"     {tag}: {name}")
            elif tag == "SceneType":
                scene_names = {1: "Directly photographed"}
                name = scene_names.get(value, f"Other ({value})")
                lines.append(f"     {tag}: {name}")
            else:
                lines.append(f"     {tag}: {value}")

    gps = exif_data.get("GPS", {})
    if gps:
        lines.append("  \U0001f30d GPS Location:")
        lat = gps.get("GPSLatitude")
        lat_ref = gps.get("GPSLatitudeRef", "")
        lon = gps.get("GPSLongitude")
        lon_ref = gps.get("GPSLongitudeRef", "")

        if lat and lat_ref:
            lines.append(f"     Latitude: {format_gps_coordinate(lat, lat_ref)}")
        if lon and lon_ref:
            lines.append(f"     Longitude: {format_gps_coordinate(lon, lon_ref)}")

        for tag, value in gps.items():
            if tag not in ("GPSLatitude", "GPSLatitudeRef", "GPSLongitude", "GPSLongitudeRef"):
                lines.append(f"     {tag}: {value}")

    return lines


# ─── AI Detection ────────────────────────────────────────────────────────────


class AIDetectionResult:
    """Holds AI detection findings for a single file."""

    def __init__(self):
        self.confirmed_signals: list[str] = []  # strong evidence of AI generation
        self.suspicious_signals: list[str] = []  # heuristic indicators
        self.generator: str | None = None  # identified generator name

    @property
    def is_ai_confirmed(self) -> bool:
        return len(self.confirmed_signals) > 0

    @property
    def is_ai_suspected(self) -> bool:
        return len(self.suspicious_signals) > 0

    def format(self) -> list[str]:
        lines = []
        if self.is_ai_confirmed:
            gen = f" ({self.generator})" if self.generator else ""
            lines.append(f"  \U0001f916 AI-GENERATED{gen}:")
            for signal in self.confirmed_signals:
                lines.append(f"     \u2714 {signal}")
        if self.is_ai_suspected:
            if not self.is_ai_confirmed:
                lines.append("  \U0001f916 Possibly AI-generated (heuristic):")
            for signal in self.suspicious_signals:
                lines.append(f"     \u26a0 {signal}")
        return lines


def detect_ai_in_text_metadata(key: str, value: str, result: AIDetectionResult) -> None:
    """Check a text metadata key/value pair for AI generator signatures."""
    key_lower = key.lower()
    value_lower = value.lower()

    # IPTC DigitalSourceType — official AI classification standard
    if key_lower in ("digitalsourcetype", "iptc4xmpext:digitalsourcetype"):
        ai_source_types = ["trainedalgorithmicmedia", "compositewithtrainedalgorithmicmedia", "algorithmicmedia"]
        for source_type in ai_source_types:
            if source_type in value_lower:
                result.confirmed_signals.append(f"IPTC DigitalSourceType indicates AI-generated: {value}")
                return

    # Direct AI generator keys
    if key_lower == "parameters" and ("steps:" in value_lower or "sampler:" in value_lower
                                       or "cfg scale:" in value_lower or "seed:" in value_lower):
        result.confirmed_signals.append(f"Stable Diffusion parameters found in '{key}' metadata")
        result.generator = "Stable Diffusion"
        return

    if key_lower == "prompt" and len(value) > 10:
        result.confirmed_signals.append(f"AI prompt stored in '{key}' metadata")
        result.generator = "Stable Diffusion / ComfyUI"
        return

    if key_lower == "negative_prompt" and len(value) > 5:
        result.confirmed_signals.append(f"AI negative prompt found in '{key}' metadata")
        result.generator = "Stable Diffusion / ComfyUI"
        return

    if key_lower == "workflow" and ("nodes" in value_lower or "class_type" in value_lower):
        result.confirmed_signals.append(f"ComfyUI workflow data found in '{key}' metadata")
        result.generator = "ComfyUI"
        return

    if key_lower in ("sd-metadata", "invokeai_metadata", "aesthetic_score", "generation_data", "postprocessing"):
        result.confirmed_signals.append(f"AI generator metadata key: '{key}'")
        result.generator = key_lower.replace("-metadata", "").replace("_metadata", "").title()
        return

    if key_lower == "dream" and len(value) > 5:
        result.confirmed_signals.append(f"Stable Diffusion Dream prompt in '{key}' metadata")
        result.generator = "Stable Diffusion"
        return

    # UserComment containing AI generation data
    if key_lower == "usercomment":
        for ai_name in AI_SOFTWARE_NAMES:
            if ai_name in value_lower:
                result.confirmed_signals.append(f"UserComment references AI tool: {ai_name}")
                result.generator = ai_name.title()
                return
        if ("steps:" in value_lower or "sampler:" in value_lower
                or "cfg scale:" in value_lower) and len(value) > 50:
            result.confirmed_signals.append("UserComment contains AI generation parameters")
            result.generator = "Stable Diffusion"
            return

    # Check value for known AI tool references
    for ai_name in AI_SOFTWARE_NAMES:
        if ai_name in value_lower:
            result.confirmed_signals.append(f"AI tool reference '{ai_name}' found in {key}")
            result.generator = ai_name.title()
            return

    # Midjourney description pattern
    if key_lower == "description" and ("--ar" in value or "--v" in value or "--style" in value):
        result.confirmed_signals.append(f"Midjourney prompt syntax detected in '{key}'")
        result.generator = "Midjourney"
        return


def detect_ai_in_xmp(xmp_data: str, result: AIDetectionResult) -> None:
    """Check XMP data for AI generation indicators."""
    xmp_lower = xmp_data.lower()

    # IPTC DigitalSourceType — official standard for AI content
    if "digitalsourcetype" in xmp_lower:
        ai_source_types = ["trainedalgorithmicmedia", "compositewithtrainedalgorithmicmedia", "algorithmicmedia"]
        for source_type in ai_source_types:
            if source_type in xmp_lower:
                result.confirmed_signals.append(f"XMP DigitalSourceType indicates AI: {source_type}")
                return

    # C2PA / Content Credentials
    if "c2pa" in xmp_lower or "contentcredentials" in xmp_lower:
        result.confirmed_signals.append("C2PA Content Credentials metadata present")
        # Try to identify the tool
        if "firefly" in xmp_lower:
            result.generator = "Adobe Firefly"
        elif "dall-e" in xmp_lower or "dalle" in xmp_lower:
            result.generator = "DALL-E"
        elif "midjourney" in xmp_lower:
            result.generator = "Midjourney"
        elif "openai" in xmp_lower or "chatgpt" in xmp_lower:
            result.generator = "ChatGPT / DALL-E"
        return

    # ai:generatedBy tag
    if "ai:generatedby" in xmp_lower or "ai:generated" in xmp_lower:
        result.confirmed_signals.append("XMP ai:generatedBy tag found")
        return

    # Check CreatorTool for AI tools
    creator_start = xmp_data.find("xmp:CreatorTool")
    if creator_start != -1:
        creator_section = xmp_data[creator_start : creator_start + 200].lower()
        for ai_name in AI_SOFTWARE_NAMES:
            if ai_name in creator_section:
                result.confirmed_signals.append(f"XMP CreatorTool references AI tool: {ai_name}")
                result.generator = ai_name.title()
                return


def detect_ai_in_jpg_structure(has_exif: bool, has_make_model: bool, has_camera_settings: bool,
                                filename: str, result: AIDetectionResult,
                                exif_data: dict | None = None) -> None:
    """Heuristic detection based on JPEG structure and missing camera data."""
    filename_lower = filename.lower()

    # Filename hints
    ai_filename_patterns = [
        "chatgpt", "dall-e", "dalle", "midjourney", "stable_diffusion",
        "sd_", "comfyui", "generated", "gemini", "firefly", "leonardo",
        "ideogram", "flux_", "playground", "bing_image", "copilot", "craiyon",
    ]
    for pattern in ai_filename_patterns:
        if pattern in filename_lower:
            result.suspicious_signals.append(f"Filename contains AI-related pattern: '{pattern}'")
            break

    # Check FileSource and SceneType from EXIF
    if exif_data:
        exif_sub = exif_data.get("ExifSubIFD", {})

        # FileSource: 3 = Digital camera (expected for real photos)
        file_source = exif_sub.get("FileSource")
        if file_source is not None and file_source != 3:
            result.suspicious_signals.append(f"FileSource={file_source} (not a digital camera)")

        # SceneType: 1 = Directly photographed
        scene_type = exif_sub.get("SceneType")
        if scene_type is not None and scene_type != 1:
            result.suspicious_signals.append(f"SceneType={scene_type} (not directly photographed)")

        # UserComment may contain AI prompts
        user_comment = exif_sub.get("UserComment", "")
        if isinstance(user_comment, str) and len(user_comment) > 10:
            comment_lower = user_comment.lower()
            for ai_name in AI_SOFTWARE_NAMES:
                if ai_name in comment_lower:
                    result.confirmed_signals.append(f"UserComment references AI tool: {ai_name}")
                    result.generator = ai_name.title()
                    break
            if "steps:" in comment_lower or "sampler:" in comment_lower or "cfg scale:" in comment_lower:
                result.confirmed_signals.append("UserComment contains AI generation parameters")
                result.generator = "Stable Diffusion"

    # Structure-based heuristics (only if no confirmed signals yet)
    if not result.is_ai_confirmed:
        if not has_exif:
            result.suspicious_signals.append("No EXIF data at all (unusual for camera photos)")
        elif has_exif and not has_make_model:
            result.suspicious_signals.append("EXIF present but no camera Make/Model (unusual for real photos)")
        elif has_exif and has_make_model and not has_camera_settings:
            pass  # Real camera, probably not AI


def detect_ai_in_png_structure(has_any_metadata: bool, chunk_types: list[str],
                                filename: str, result: AIDetectionResult) -> None:
    """Heuristic detection based on PNG structure."""
    filename_lower = filename.lower()

    # Filename hints
    ai_filename_patterns = [
        "chatgpt", "dall-e", "dalle", "midjourney", "stable_diffusion",
        "sd_", "comfyui", "generated", "gemini", "firefly", "leonardo",
        "ideogram", "flux_", "playground", "bing_image", "copilot", "craiyon",
    ]
    for pattern in ai_filename_patterns:
        if pattern in filename_lower:
            result.suspicious_signals.append(f"Filename contains AI-related pattern: '{pattern}'")
            break

    # C2PA JUMBF box in PNG
    if "jUMb" in chunk_types or "caBX" in chunk_types:
        result.suspicious_signals.append("Contains JUMBF/caBX chunk (may indicate C2PA content credentials)")


def detect_ai_c2pa_jpeg(data: bytes, result: AIDetectionResult) -> None:
    """Check for C2PA/JUMBF markers in JPEG data."""
    # C2PA uses APP11 (0xFFEB) segments with JUMBF
    if b"jumb" in data[:10000] or b"JUMB" in data[:10000]:
        result.confirmed_signals.append("C2PA JUMBF content credentials detected")
    # Also check for urn:uuid pattern used by C2PA
    if b"c2pa" in data[:50000]:
        result.confirmed_signals.append("C2PA identifier found in file data")


# ─── Scanners ────────────────────────────────────────────────────────────────


def scan_jpg(path: str) -> tuple[list[str], AIDetectionResult]:
    """Scan JPEG file for metadata segments with detailed output and AI detection."""
    with open(path, "rb") as f:
        data = f.read()

    if data[:2] != b"\xff\xd8":
        return ["Not a valid JPEG file"], AIDetectionResult()

    ai_result = AIDetectionResult()
    results = []
    i = 2
    has_metadata = False
    has_exif = False
    has_make_model = False
    has_camera_settings = False
    parsed_exif = None

    # Check for C2PA markers
    detect_ai_c2pa_jpeg(data, ai_result)

    while i < len(data) - 1:
        if data[i] != 0xFF:
            i += 1
            continue

        marker = data[i : i + 2]

        if marker == b"\xff\xda":
            break

        if marker[1:2] in (b"\xff", b"\x00"):
            i += 1
            continue

        if i + 3 >= len(data):
            break
        size = struct.unpack(">H", data[i + 2 : i + 4])[0]
        segment_data = data[i + 4 : i + 2 + size]

        if marker == b"\xff\xe1":
            has_metadata = True
            if segment_data[:4] == b"Exif":
                has_exif = True
                results.append(f"  APP1/EXIF ({size:,} bytes)")
                exif_result = parse_exif(segment_data)
                parsed_exif = exif_result
                detail_lines = format_exif_results(exif_result)
                results.extend(detail_lines)

                # Check for camera indicators
                ifd0 = exif_result.get("IFD0", {})
                if ifd0.get("Make") or ifd0.get("Model"):
                    has_make_model = True
                exif_sub = exif_result.get("ExifSubIFD", {})
                if exif_sub.get("ExposureTime") or exif_sub.get("FNumber") or exif_sub.get("ISOSpeedRatings"):
                    has_camera_settings = True

                # Check software field for AI
                software = str(ifd0.get("Software", "")).lower()
                for ai_name in AI_SOFTWARE_NAMES:
                    if ai_name in software:
                        ai_result.confirmed_signals.append(f"EXIF Software field references AI tool: {software}")
                        ai_result.generator = ai_name.title()

            elif b"http://ns.adobe.com/xap" in segment_data:
                results.append(f"  APP1/XMP ({size:,} bytes)")
                xmp_str = segment_data.decode("utf-8", errors="replace")
                # AI detection in XMP
                detect_ai_in_xmp(xmp_str, ai_result)
                # Display interesting XMP fields
                for field in ["dc:creator", "dc:description", "dc:title", "xmp:CreatorTool",
                              "photoshop:City", "photoshop:Country"]:
                    start = xmp_str.find(f"<{field}")
                    if start != -1:
                        end = xmp_str.find(f"</{field}", start)
                        if end != -1:
                            snippet = xmp_str[start : end + len(field) + 3][:200]
                            results.append(f"     {field}: {snippet}")
            else:
                results.append(f"  APP1/Unknown ({size:,} bytes)")

        elif marker == b"\xff\xe0":
            results.append(f"  APP0/JFIF ({size:,} bytes)")

        elif marker == b"\xff\xe2":
            has_metadata = True
            results.append(f"  APP2/ICC Color Profile ({size:,} bytes)")

        elif marker == b"\xff\xeb":
            has_metadata = True
            results.append(f"  APP11/JUMBF ({size:,} bytes)")
            # APP11 is used for C2PA content credentials
            if b"jumb" in segment_data or b"c2pa" in segment_data:
                ai_result.confirmed_signals.append("APP11 JUMBF segment with C2PA content credentials")

        elif marker == b"\xff\xed":
            has_metadata = True
            results.append(f"  APP13/IPTC ({size:,} bytes)")
            # Extract IPTC text fields
            iptc_text_parts = []
            j = 0
            while j < len(segment_data) - 5:
                if segment_data[j : j + 2] == b"\x1c\x02":
                    record_type = segment_data[j + 2]
                    field_len = struct.unpack(">H", segment_data[j + 3 : j + 5])[0]
                    field_data = segment_data[j + 5 : j + 5 + field_len]
                    iptc_names = {
                        5: "ObjectName", 25: "Keywords", 80: "By-line",
                        85: "By-lineTitle", 90: "City", 95: "Province",
                        100: "CountryCode", 101: "Country", 105: "Headline",
                        110: "Credit", 115: "Source", 116: "Copyright",
                        120: "Caption",
                    }
                    name = iptc_names.get(record_type, f"Field({record_type})")
                    try:
                        text = field_data.decode("utf-8", errors="replace")
                        iptc_text_parts.append(f"     {name}: {text}")
                    except Exception:
                        pass
                    j += 5 + field_len
                else:
                    j += 1
            results.extend(iptc_text_parts)

        elif marker == b"\xff\xee":
            has_metadata = True
            results.append(f"  APP14/Adobe ({size:,} bytes)")

        elif marker == b"\xff\xfe":
            has_metadata = True
            comment = segment_data[:200].decode("utf-8", errors="replace")
            results.append(f"  COM/Comment: \"{comment}\"")
            # Check comment for AI hints
            detect_ai_in_text_metadata("Comment", comment, ai_result)

        elif marker[1:2] >= b"\xe0" and marker[1:2] <= b"\xef":
            app_num = marker[1] - 0xE0
            if app_num not in (0,):
                has_metadata = True
                results.append(f"  APP{app_num} ({size:,} bytes)")

        i += 2 + size

    if not has_metadata:
        results = ["  \u2705 No metadata found (clean file)"]

    # Structural AI detection
    detect_ai_in_jpg_structure(has_exif, has_make_model, has_camera_settings,
                               os.path.basename(path), ai_result, parsed_exif)

    return results, ai_result


def scan_png(path: str) -> tuple[list[str], AIDetectionResult]:
    """Scan PNG file for metadata chunks with detailed output and AI detection."""
    with open(path, "rb") as f:
        sig = f.read(8)
        if sig != b"\x89PNG\r\n\x1a\n":
            return ["  Not a valid PNG file"], AIDetectionResult()

        ai_result = AIDetectionResult()
        results = []
        has_metadata = False
        chunk_types = []

        while True:
            header = f.read(8)
            if len(header) < 8:
                break

            length = struct.unpack(">I", header[:4])[0]
            chunk_type = header[4:8].decode("ascii", errors="replace")
            chunk_types.append(chunk_type)

            metadata_types = {"tEXt", "iTXt", "zTXt", "eXIf", "iCCP"}

            if chunk_type in metadata_types:
                has_metadata = True
                chunk_data = f.read(length)
                f.read(4)  # CRC

                if chunk_type == "tEXt":
                    parts = chunk_data.split(b"\x00", 1)
                    key = parts[0].decode("ascii", errors="replace")
                    val = parts[1].decode("utf-8", errors="replace") if len(parts) > 1 else ""
                    results.append(f"  tEXt chunk:")
                    results.append(f"     Key: {key}")
                    if len(val) > 300:
                        results.append(f"     Value: {val[:300]}... ({len(val)} chars total)")
                    else:
                        results.append(f"     Value: {val}")
                    # AI detection
                    detect_ai_in_text_metadata(key, val, ai_result)

                elif chunk_type == "iTXt":
                    parts = chunk_data.split(b"\x00", 1)
                    key = parts[0].decode("ascii", errors="replace")
                    results.append(f"  iTXt chunk ({length:,} bytes):")
                    results.append(f"     Key: {key}")
                    if len(parts) > 1:
                        rest = parts[1]
                        text = rest.decode("utf-8", errors="replace")[:500]
                        results.append(f"     Content: {text[:300]}")
                        # AI detection
                        detect_ai_in_text_metadata(key, text, ai_result)
                        # XMP in iTXt
                        if "http://ns.adobe.com/xap" in text or "xmlns:xmp" in text:
                            full_text = rest.decode("utf-8", errors="replace")
                            detect_ai_in_xmp(full_text, ai_result)

                elif chunk_type == "zTXt":
                    parts = chunk_data.split(b"\x00", 1)
                    key = parts[0].decode("ascii", errors="replace")
                    results.append(f"  zTXt chunk ({length:,} bytes, compressed):")
                    results.append(f"     Key: {key}")
                    if len(parts) > 1 and len(parts[1]) > 1:
                        import zlib
                        try:
                            decompressed = zlib.decompress(parts[1][1:])
                            text = decompressed.decode("utf-8", errors="replace")
                            if len(text) > 300:
                                results.append(f"     Value: {text[:300]}... ({len(text)} chars total)")
                            else:
                                results.append(f"     Value: {text}")
                            detect_ai_in_text_metadata(key, text, ai_result)
                        except Exception:
                            results.append(f"     Value: <compressed, {length} bytes>")

                elif chunk_type == "eXIf":
                    results.append(f"  eXIf chunk ({length:,} bytes):")
                    exif_result = parse_exif(chunk_data)
                    detail_lines = format_exif_results(exif_result)
                    results.extend(detail_lines)
                    # Check software
                    ifd0 = exif_result.get("IFD0", {})
                    software = str(ifd0.get("Software", "")).lower()
                    for ai_name in AI_SOFTWARE_NAMES:
                        if ai_name in software:
                            ai_result.confirmed_signals.append(f"EXIF Software references AI: {software}")
                            ai_result.generator = ai_name.title()

                elif chunk_type == "iCCP":
                    parts = chunk_data.split(b"\x00", 1)
                    profile_name = parts[0].decode("ascii", errors="replace")
                    results.append(f"  iCCP chunk ({length:,} bytes):")
                    results.append(f"     Profile: {profile_name}")

            elif chunk_type == "jUMb":
                # JUMBF chunk — C2PA content credentials
                has_metadata = True
                chunk_data = f.read(length)
                f.read(4)
                results.append(f"  jUMb/JUMBF chunk ({length:,} bytes) — Content Credentials")
                if b"c2pa" in chunk_data:
                    ai_result.confirmed_signals.append("JUMBF chunk with C2PA content credentials")

            elif chunk_type == "caBX":
                # caBX is also used for content credentials (seen in ChatGPT images)
                has_metadata = True
                chunk_data = f.read(length)
                f.read(4)
                results.append(f"  caBX chunk ({length:,} bytes) — Content Box")
                # Check for C2PA/content credential signatures
                if b"c2pa" in chunk_data or b"jumb" in chunk_data:
                    ai_result.confirmed_signals.append("caBX chunk contains C2PA content credentials")
                    if b"openai" in chunk_data or b"ChatGPT" in chunk_data:
                        ai_result.generator = "ChatGPT / DALL-E"
                    elif b"google" in chunk_data or b"Gemini" in chunk_data:
                        ai_result.generator = "Google Gemini"
                else:
                    ai_result.suspicious_signals.append("caBX chunk present (often used by AI generators for content provenance)")
            else:
                f.seek(length + 4, 1)

    if not has_metadata:
        results = ["  \u2705 No metadata found (clean file)"]

    # Structural AI detection
    detect_ai_in_png_structure(has_metadata, chunk_types, os.path.basename(path), ai_result)

    return results, ai_result


def scan_file(path: str) -> None:
    """Scan a single file and print results."""
    size = os.path.getsize(path)
    print(f"\n{'─' * 60}")
    print(f"\U0001f4c4 {os.path.basename(path)}")
    print(f"   Path: {path}")
    print(f"   Size: {size:,} bytes")
    print(f"{'─' * 60}")

    lower = path.lower()
    if lower.endswith((".jpg", ".jpeg")):
        results, ai_result = scan_jpg(path)
    elif lower.endswith(".png"):
        results, ai_result = scan_png(path)
    else:
        results = ["  Unsupported format (only JPEG and PNG supported)"]
        ai_result = AIDetectionResult()

    for line in results:
        print(line)

    # Print AI detection results
    ai_lines = ai_result.format()
    if ai_lines:
        print()
        for line in ai_lines:
            print(line)
    elif not ai_result.is_ai_confirmed and not ai_result.is_ai_suspected:
        print()
        print("  \U0001f4f7 Origin: Likely a real camera photo")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    paths = sys.argv[1:]
    files_to_scan = []

    for path in paths:
        if os.path.isfile(path):
            files_to_scan.append(path)
        elif os.path.isdir(path):
            for fname in sorted(os.listdir(path)):
                fpath = os.path.join(path, fname)
                if os.path.isfile(fpath) and fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    files_to_scan.append(fpath)
        else:
            print(f"\u26a0\ufe0f  Warning: '{path}' not found, skipping.")

    if not files_to_scan:
        print("No image files found to scan.")
        sys.exit(1)

    print(f"\n\U0001f50d Scanning {len(files_to_scan)} file(s) for metadata and AI indicators...")

    for fpath in files_to_scan:
        scan_file(fpath)

    print(f"\n{'─' * 60}")
    print(f"\u2705 Done. Scanned {len(files_to_scan)} file(s).")
    print()


if __name__ == "__main__":
    main()
