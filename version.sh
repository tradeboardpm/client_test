#!/bin/bash

# Set strict mode
set -euo pipefail

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_color() {
    local color="$1"
    local message="$2"
    echo -e "${color}${message}${NC}"
}

validate_semver() {
    local version="$1"
    if [[ ! $version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_color "$RED" "Error: Version '$version' is not in valid semver format"
        exit 1
    fi
}

update_changelog() {
    local version="$1"
    local date=$(date '+%Y-%m-%d')

    if [ ! -f "CHANGELOG.md" ]; then
        print_color "$YELLOW" "CHANGELOG.md not found. Creating a new one..."
        echo -e "# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).\n" > CHANGELOG.md
    fi

    # Update the changelog
    sed -i "1s/^/# Changelog\n\n## [$version] - $date\n### Added\n- \n\n### Changed\n- \n\n### Fixed\n- \n\n/" CHANGELOG.md

    print_color "$GREEN" "CHANGELOG.md updated with version $version."
}

update_env_version() {
    local version="$1"
    local env_file=".env"

    # Check if .env file exists
    if [ ! -f "$env_file" ]; then
        print_color "$YELLOW" ".env file not found. Creating a new one..."
        touch "$env_file"
    fi

    # Remove existing NEXT_PUBLIC_APP_VERSION line if it exists
    sed -i '/^NEXT_PUBLIC_APP_VERSION=/d' "$env_file"

    # Add new version to .env file
    echo "NEXT_PUBLIC_APP_VERSION=${version#v}" >> "$env_file"

    print_color "$GREEN" ".env file updated with version $version."
}

# Check if git is installed
if ! command -v git >/dev/null 2>&1; then
    print_color "$RED" "Error: Git is not installed or not in PATH"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    print_color "$RED" "Error: Not a git repository"
    exit 1
fi

# Fetch latest changes and tags
git fetch --tags --quiet || {
    print_color "$RED" "Error: Failed to fetch tags from remote"
    exit 1
}

# Get the latest tag
current_version=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
current_version=${current_version#v}  # Remove 'v' prefix

# Validate current version format
validate_semver "$current_version"

# Split version into components
IFS='.' read -r major minor patch <<< "$current_version"

# Show current version
print_color "$CYAN" "\nCurrent version: v$current_version"

# Calculate and show next versions
print_color "$YELLOW" "\nPossible version updates:"
print_color "$GREEN" "1) Patch (bug fixes)      - v$major.$minor.$((patch + 1))"
print_color "$GREEN" "2) Minor (new features)   - v$major.$((minor + 1)).0"
print_color "$GREEN" "3) Major (breaking)       - v$((major + 1)).0.0"

# Get user choice with input validation
while true; do
    read -rp $'\nEnter choice (1-3): ' choice
    if [[ "$choice" =~ ^[1-3]$ ]]; then
        break
    fi
    print_color "$RED" "Invalid choice. Please enter 1, 2, or 3."
done

# Calculate new version
case $choice in
    1)
        new_version="v$major.$minor.$((patch + 1))"
        ;;
    2)
        new_version="v$major.$((minor + 1)).0"
        ;;
    3)
        new_version="v$((major + 1)).0.0"
        ;;
esac

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    print_color "$YELLOW" "\nUncommitted changes detected:"
    git status --short
fi

# Show summary and get confirmation
print_color "$YELLOW" "\nVersion update summary:"
print_color "$CYAN" "Current version: v$current_version"
print_color "$CYAN" "New version    : $new_version"

read -rp $'\nDo you want to proceed? (y/N): ' confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    print_color "$YELLOW" "Operation cancelled"
    exit 0
fi

# Get commit message with validation
while true; do
    read -rp $'\nEnter commit message: ' commit_message
    if [[ -n "$commit_message" ]]; then
        break
    fi
    print_color "$RED" "Commit message cannot be empty"
done

# Update CHANGELOG.md
update_changelog "$new_version"

# Update .env file with new version
update_env_version "$new_version"

# Create commit and tag
print_color "$YELLOW" "\nCreating commit and tag..."
git add . || {
    print_color "$RED" "Error: Failed to stage changes"
    exit 1
}

git commit -m "$commit_message" || {
    print_color "$RED" "Error: Failed to create commit"
    exit 1
}

git tag -a "$new_version" -m "Version $new_version" || {
    print_color "$RED" "Error: Failed to create tag"
    exit 1
}

# Prompt for branch name
while true; do
    read -rp $'\nEnter the branch name to push (default: main): ' branch_name
    branch_name="${branch_name:-main}"  # Default to 'main' if no input
    if git rev-parse --verify "$branch_name" >/dev/null 2>&1; then
        break
    else
        print_color "$RED" "Branch '$branch_name' does not exist. Please enter a valid branch."
    fi
done

# Push changes
print_color "$YELLOW" "Pushing changes to remote branch '$branch_name'..."
git push origin "$branch_name" || {
    print_color "$RED" "Error: Failed to push to branch '$branch_name'"
    exit 1
}

git push origin --tags || {
    print_color "$RED" "Error: Failed to push tags"
    exit 1
}

print_color "$GREEN" "\nSuccessfully released version $new_version on branch '$branch_name'! 🎉"