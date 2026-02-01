#!/usr/bin/env python3
import re

# Read the file
with open('/Users/kishoredhanasekar/LOOPIFY/Loopify-1/app.html', 'r') as f:
    content = f.read()

# Add quantity field after item ID in ReturnBox
returnbox_pattern = r'(<label class="block text-sm font-medium mb-2">Item ID or QR<\/label>\s*<input type="text" id="return-item-id"[^>]*\/>\s*<\/div>)'
returnbox_replacement = r'\1\n\n            <div>\n              <label class="block text-sm font-medium mb-2">Quantity</label>\n              <input type="number" id="return-quantity" class="input-premium w-full" min="1" value="1" required />\n            </div>'

content = re.sub(returnbox_pattern, returnbox_replacement, content)

# Replace Returns Log with Returns Log & EcoPoints
old_returnbox_log = '<h2 class="text-xl font-semibold mb-4">Return History<\/h2>'
new_returnbox_log = '<h2 class="text-xl font-semibold mb-4">Return History & EcoPoints<\/h2>\n          <div class="bg-opacity-10 bg-sage-accent p-4 rounded mb-4 border border-sage-accent">\n            <p class="text-sm text-muted mb-1">EcoPoints Earned<\/p>\n            <p class="text-3xl font-bold sage-accent" id="returnbox-ecopoints">+20<\/p>\n            <p class="text-xs text-muted mt-2">per item returned<\/p>\n          <\/div>'

content = re.sub(old_returnbox_log, new_returnbox_log, content, count=1)

# Add Collection Drive Info section after stats
old_returnbox_stats = r'(<div class="stat-card">\s*<div class="stat-number" id="return-rate">0%<\/div>\s*<div class="stat-label">Reuse Rate<\/div>\s*<\/div>\s*<\/div>\s*<\/section>)'
new_returnbox_section = r'\1'

# First find and update the ReturnBox description
old_desc_returnbox = '<p class="text-muted text-lg">Track circular returns and measure reuse impact.<\/p>'
new_desc_returnbox = '<p class="text-muted text-lg">Track circular returns, earn EcoPoints, and choose your collection method.<\/p>'
content = content.replace(old_desc_returnbox, new_desc_returnbox, 1)

# Update MaterialBank
old_material_form = r'(<h2 class="text-xl font-semibold mb-6">List Material<\/h2>\s*<form id="material-name")'
new_material_form = r'<h2 class="text-xl font-semibold mb-6">List Material<\/h2>\n          <form id="materialbank-form"'
content = re.sub(old_material_form, new_material_form, content)

# Fix form ID if needed
content = content.replace('id="material-name" class="space-y-4">', 'id="materialbank-form" class="space-y-4">')

# Update MaterialBank description
old_desc_materialbank = '<p class="text-muted text-lg">Industrial reuse marketplace — Match waste with reusers in real-time.<\/p>'
new_desc_materialbank = '<p class="text-muted text-lg">Industrial reuse marketplace — Match waste with reusers, earn EcoPoints, and organize collection.<\/p>'
content = content.replace(old_desc_materialbank, new_desc_materialbank, 1)

# Write back
with open('/Users/kishoredhanasekar/LOOPIFY/Loopify-1/app.html', 'w') as f:
    f.write(content)

print("✅ app.html updated with collection drive integration")
