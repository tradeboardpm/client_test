# Function to validate semver format
function Test-SemVer {
    param ([string]$version)
    return $version -match '^\d+\.\d+\.\d+$'
}

function Write-ColorOutput {
    param ([string]$message, [string]$color = 'White')
    Write-Host $message -ForegroundColor $color
}

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "Error: Git is not installed or not in PATH" -color Red
    exit 1
}

# Check if we're in a git repository
if (!(Test-Path .git)) {
    Write-ColorOutput "Error: Not a git repository" -color Red
    exit 1
}

try {
    # Fetch latest changes and tags
    git fetch --tags --quiet

    # Get the latest tag
    $currentVersion = (git describe --tags --abbrev=0 2>$null) ?? "v0.0.0"
    $currentVersion = $currentVersion.TrimStart('v')

    if (!(Test-SemVer $currentVersion)) {
        Write-ColorOutput "Error: Current version '$currentVersion' is not in valid semver format" -color Red
        exit 1
    }

    # Split version into components
    $versionParts = $currentVersion.Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]

    # Show current version
    Write-ColorOutput "`nCurrent version: v$currentVersion" -color Cyan

    # Calculate and show next versions
    Write-ColorOutput "`nPossible version updates:" -color Yellow
    Write-ColorOutput "1) Patch (bug fixes)      - v$major.$minor.$($patch + 1)" -color Green
    Write-ColorOutput "2) Minor (new features)   - v$major.$($minor + 1).0" -color Green
    Write-ColorOutput "3) Major (breaking)       - v$($major + 1).0.0" -color Green

    # Get user choice with input validation
    do {
        $choice = Read-Host "`nEnter choice (1-3)"
        if ($choice -notin '1', '2', '3') {
            Write-ColorOutput "Invalid choice. Please enter 1, 2, or 3." -color Red
        }
    } while ($choice -notin '1', '2', '3')

    # Calculate new version
    $newVersion = switch ($choice) {
        "1" { "v$major.$minor.$($patch + 1)" }
        "2" { "v$major.$($minor + 1).0" }
        "3" { "v$($major + 1).0.0" }
    }

    # Check for uncommitted changes
    $status = git status --porcelain
    if ($status) {
        Write-ColorOutput "`nUncommitted changes detected:" -color Yellow
        git status --short
    }

    # Show summary and get confirmation
    Write-ColorOutput "`nVersion update summary:" -color Yellow
    Write-ColorOutput "Current version: v$currentVersion" -color Cyan
    Write-ColorOutput "New version    : $newVersion" -color Cyan
    
    $confirm = Read-Host "`nDo you want to proceed? (y/N)"
    if ($confirm -ne 'y') {
        Write-ColorOutput "Operation cancelled" -color Yellow
        exit 0
    }

    # Get commit message with validation
    do {
        $commitMessage = Read-Host "`nEnter commit message"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            Write-ColorOutput "Commit message cannot be empty" -color Red
        }
    } while ([string]::IsNullOrWhiteSpace($commitMessage))

    # Create commit and tag
    Write-ColorOutput "`nCreating commit and tag..." -color Yellow
    git add .
    git commit -m "$commitMessage"
    git tag -a $newVersion -m "Version $newVersion"

    # Push changes
    Write-ColorOutput "Pushing changes to remote..." -color Yellow
    git push origin main
    git push origin --tags

    Write-ColorOutput "`nSuccessfully released version $newVersion! 🎉" -color Green
    
} catch {
    Write-ColorOutput "`nError: $($_.Exception.Message)" -color Red
    exit 1
}