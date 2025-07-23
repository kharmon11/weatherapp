#!/bin/bash
# generate-structure.sh
# Generates a markdown-formatted project structure and inserts it into README.md
# between <!-- START STRUCTURE --> and <!-- END STRUCTURE --> markers.

# Always run from project root
cd "$(dirname "$0")/.." || exit 1

# Create a temporary file for the structure content
STRUCTURE_CONTENT=$(mktemp) || { echo "❌ Failed to create temporary file"; exit 1; }

# Configuration
MAX_DEPTH=3
EXCLUDE_DIRS="node_modules|venv|__pycache__|.git|.idea|dist|.sass-cache|build|coverage|assets|*.egg-info"

# Generate structure block
echo '```text' > "$STRUCTURE_CONTENT"
tree -I "$EXCLUDE_DIRS" -L "$MAX_DEPTH" --noreport | sed 's/\xC2\xA0/ /g' >> "$STRUCTURE_CONTENT" || { echo "❌ Failed to generate tree structure"; exit 1; }
echo '```' >> "$STRUCTURE_CONTENT"

README="README.md"
START_MARKER="<!-- START STRUCTURE -->"
END_MARKER="<!-- END STRUCTURE -->"

# Check if README exists
if [ ! -f "$README" ]; then
  echo "❌ $README not found in project root"
  rm "$STRUCTURE_CONTENT"
  exit 1
fi

# Replace structure block in README
if grep -q "$START_MARKER" "$README"; then
  awk -v start="$START_MARKER" -v end="$END_MARKER" -v file="$STRUCTURE_CONTENT" '
    BEGIN { inside=0 }
    {
      if ($0 ~ start) {
        print $0
        system("cat " file)
        inside=1
      } else if ($0 ~ end) {
        inside=0
        print $0
      } else if (!inside) {
        print $0
      }
    }
  ' "$README" > "$README.tmp" && mv "$README.tmp" "$README" || { echo "❌ Failed to update $README"; rm "$STRUCTURE_CONTENT"; exit 1; }
  echo "✅ $README updated with new structure."
else
  echo "❌ $README does not contain structure markers."
  echo "Please add:"
  echo "$START_MARKER"
  echo "$END_MARKER"
fi

# Clean up
rm "$STRUCTURE_CONTENT"