# Unset ELECTRON_RUN_AS_NODE to ensure Electron runs properly
$env:ELECTRON_RUN_AS_NODE = $null

# Run the dev command
npm run electron:dev
