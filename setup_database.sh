#!/bin/bash

##############################################################################
# LOOPIFY DATABASE SETUP SCRIPT
# 
# Initializes a complete SQLite database for the Loopify platform
# Creates schema, loads seed data, and validates setup
#
# Usage: bash setup_database.sh
##############################################################################

set -e

DB_FILE="loopify.db"
SCHEMA_FILE="database_schema.sql"
SEED_FILE="database_seed_data.sql"

echo "╔════════════════════════════════════════════════════════╗"
echo "║   LOOPIFY DATABASE SETUP - SQLite                      ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if SQLite is installed
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ ERROR: sqlite3 is not installed"
    echo "   macOS: brew install sqlite"
    echo "   Linux: sudo apt-get install sqlite3"
    exit 1
fi

echo "✓ SQLite3 found: $(sqlite3 --version)"
echo ""

# Remove old database if it exists
if [ -f "$DB_FILE" ]; then
    echo "⚠️  Existing database found. Creating backup..."
    cp "$DB_FILE" "${DB_FILE}.backup.$(date +%s)"
    rm "$DB_FILE"
    echo "✓ Backup created"
fi

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo "❌ ERROR: $SCHEMA_FILE not found in current directory"
    exit 1
fi

echo "📝 Creating database schema..."
sqlite3 "$DB_FILE" < "$SCHEMA_FILE"
echo "✓ Schema created successfully"
echo ""

# Optionally load seed data
if [ -f "$SEED_FILE" ]; then
    read -p "Load seed data? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Loading seed data..."
        sqlite3 "$DB_FILE" < "$SEED_FILE"
        echo "✓ Seed data loaded successfully"
        echo ""
    fi
else
    echo "⚠️  Warning: $SEED_FILE not found. Skipping seed data."
    echo ""
fi

# Validate database
echo "🔍 Validating database..."
echo ""

# Check table count
TABLE_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';")
echo "   Tables created: $TABLE_COUNT"

# List all tables
echo ""
echo "   Tables:"
sqlite3 "$DB_FILE" "SELECT '     • ' || name FROM sqlite_master WHERE type='table' ORDER BY name;" 

# Check user count if seed data was loaded
USER_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
if [ "$USER_COUNT" -gt 0 ]; then
    echo ""
    echo "   Seed data statistics:"
    sqlite3 "$DB_FILE" << EOF
SELECT '     • Users: ' || COUNT(*) FROM users
UNION ALL
SELECT '     • Hubs: ' || COUNT(*) FROM hubs
UNION ALL
SELECT '     • Thrift Items: ' || COUNT(*) FROM thrift_items
UNION ALL
SELECT '     • Auctions: ' || COUNT(*) FROM auctions
UNION ALL
SELECT '     • Returns: ' || COUNT(*) FROM returns
UNION ALL
SELECT '     • EcoTransactions: ' || COUNT(*) FROM eco_transactions;
EOF
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║           DATABASE SETUP COMPLETE ✓                    ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Database file: $DB_FILE"
echo ""
echo "Quick commands:"
echo "  • View database: sqlite3 $DB_FILE"
echo "  • Run queries:  sqlite3 $DB_FILE < query_file.sql"
echo "  • Export data:  sqlite3 $DB_FILE '.dump' > backup.sql"
echo ""
echo "Documentation:"
echo "  • Schema: database_schema.sql"
echo "  • Examples: database_example_queries.sql"
echo "  • Setup: setup_database.sh"
echo ""
