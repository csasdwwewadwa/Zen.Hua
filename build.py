import subprocess
import sys

# Define your project root and the distribution folder
project_root = r"c:\Users\csasd\source\repos\zenhua"
dist_dir = r"c:\Users\csasd\source\repos\zenhua\dist"

def run_command(command, cwd):
    """Helper function to run sequential build commands and show output."""
    print(f"\n--- Running: {' '.join(command)} in {cwd} ---")
    
    # check=True will stop the script immediately if npm run build or npx cap sync fails
    result = subprocess.run(
        command,
        cwd=cwd,
        shell=True,  # Required on Windows for npm/npx
        text=True
    )
    if result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)

# Step 1: Run the build commands sequentially in the project root
run_command(["npm", "run", "build"], cwd=project_root)
run_command(["npx", "cap", "sync"], cwd=project_root)

# Step 2: Start the persistent HTTP server in the 'dist' folder
print(f"\n--- Starting HTTP Server on port 4173 ---")
server_command = ["py", "-m", "http.server", "4173"]

process = subprocess.Popen(
    server_command,
    cwd=dist_dir,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    shell=True
)

# Stream the server logs in real-time
try:
    for line in process.stdout:
        print(line, end="")
except KeyboardInterrupt:
    print("\nStopping Python HTTP server...")
    process.terminate()