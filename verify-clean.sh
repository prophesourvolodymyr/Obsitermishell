#!/bin/bash
# Verification Script - Confirms no old terminal code exists

echo "🔍 Verifying No Old Terminal Code"
echo "=================================="
echo ""

# Test 1: ProcessController.ts deleted
echo "Test 1: ProcessController.ts file..."
if [ -f "src/ProcessController.ts" ]; then
    echo "  ❌ FAIL: ProcessController.ts still exists!"
    exit 1
else
    echo "  ✅ PASS: ProcessController.ts deleted"
fi

# Test 2: No ProcessController references
echo ""
echo "Test 2: No ProcessController references in code..."
if grep -r "ProcessController" src/ --include="*.ts" 2>/dev/null | grep -q .; then
    echo "  ❌ FAIL: Found ProcessController references:"
    grep -r "ProcessController" src/ --include="*.ts"
    exit 1
else
    echo "  ✅ PASS: No ProcessController references"
fi

# Test 3: No child_process in terminal code
echo ""
echo "Test 3: No child_process in terminal code..."
CHILD_PROCESS_RESULTS=$(grep -r "child_process" src/ --include="*.ts" | grep -v "DaemonManager" | grep -v "node-finder" | grep -v "^Binary")
if [ -n "$CHILD_PROCESS_RESULTS" ]; then
    echo "  ❌ FAIL: Found child_process usage:"
    echo "$CHILD_PROCESS_RESULTS"
    exit 1
else
    echo "  ✅ PASS: No child_process in terminal code"
fi

# Test 4: PTYController exists and uses WebSocket
echo ""
echo "Test 4: PTYController uses WebSocket daemon..."
if grep -q "private ws: WebSocket" src/PTYController.ts && grep -q "connectToDaemon" src/PTYController.ts; then
    echo "  ✅ PASS: PTYController uses WebSocket"
else
    echo "  ❌ FAIL: PTYController not using WebSocket correctly"
    exit 1
fi

# Test 5: TerminalManager creates PTYController
echo ""
echo "Test 5: TerminalManager creates PTYController..."
if grep -q "new PTYController()" src/TerminalManager.ts; then
    echo "  ✅ PASS: TerminalManager uses PTYController"
else
    echo "  ❌ FAIL: TerminalManager not using PTYController"
    exit 1
fi

# Test 6: No simulation hacks
echo ""
echo "Test 6: No PS1/TERM/CLICOLOR simulation hacks..."
HACK_RESULTS=$(grep -rE "(PS1=|TERM=|CLICOLOR=)" src/ --include="*.ts" | grep -v "daemon" | grep -v "^Binary")
if [ -n "$HACK_RESULTS" ]; then
    echo "  ❌ FAIL: Found simulation hacks:"
    echo "$HACK_RESULTS"
    exit 1
else
    echo "  ✅ PASS: No simulation hacks"
fi

# Test 7: Daemon exists
echo ""
echo "Test 7: PTY daemon exists..."
if [ -f "daemon/index.js" ] && grep -q "pty.spawn" daemon/index.js; then
    echo "  ✅ PASS: Real PTY daemon exists"
else
    echo "  ❌ FAIL: Daemon missing or invalid"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ALL TESTS PASSED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "The codebase is clean. Only real PTY daemon code exists."
echo ""
echo "What this means:"
echo "  • No old ProcessController (child_process)"
echo "  • No simulation hacks (PS1, TERM, CLICOLOR)"
echo "  • Only PTYController with WebSocket to daemon"
echo "  • Real node-pty in daemon"
echo ""
echo "If you're still seeing old terminal in Obsidian:"
echo "  1. Reload the plugin (disable/enable)"
echo "  2. Check console for 'PTY daemon started successfully'"
echo "  3. If issues persist, run: ./clean-install.sh"
