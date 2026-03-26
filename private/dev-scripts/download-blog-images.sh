#!/bin/bash

# Create images directory
mkdir -p public/assets/images

# Blog image mappings based on metadata.js
# Since the website doesn't have unique featured images, we'll use placeholder images
# that match the blog topics

# Download or create placeholder images for each blog

# GRC Compliance Management
curl -L "https://placehold.co/1200x630/3b5998/ffffff?text=GRC+Compliance+Management" \
  -o "public/assets/images/grc-compliance-management.png"

# Mastering GRC Ruleset Manager
curl -L "https://placehold.co/1200x630/3b5998/ffffff?text=GRC+Ruleset+Manager" \
  -o "public/assets/images/grc-ruleset-manager.png"

# Regained SAP Security Expert
curl -L "https://placehold.co/1200x630/ef4444/ffffff?text=SAP+Security+Expert" \
  -o "public/assets/images/regained-sap-security.png"

# Integrating Okta with SAP IAS/IPS
curl -L "https://placehold.co/1200x630/2563eb/ffffff?text=Okta+SAP+Integration" \
  -o "public/assets/images/okta-sap-integration.png"

# Public Cloud Authorization Upgrade
curl -L "https://placehold.co/1200x630/0891b2/ffffff?text=Public+Cloud+Auth+Upgrade" \
  -o "public/assets/images/public-cloud-auth-upgrade.png"

# Why Traditional SAP Audit Controls Fail
curl -L "https://placehold.co/1200x630/dc2626/ffffff?text=Audit+Controls+Fail" \
  -o "public/assets/images/audit-controls-fail.png"

# Configuration Without SPRO
curl -L "https://placehold.co/1200x630/7c3aed/ffffff?text=Configuration+Without+SPRO" \
  -o "public/assets/images/configuration-without-spro.png"

# CPC vs SPRO
curl -L "https://placehold.co/1200x630/059669/ffffff?text=CPC+vs+SPRO" \
  -o "public/assets/images/cpc-vs-spro.png"

# Public vs Private Cloud
curl -L "https://placehold.co/1200x630/0891b2/ffffff?text=Public+vs+Private+Cloud" \
  -o "public/assets/images/public-vs-private-cloud.png"

# SAP Cybersecurity Insights Podcast
curl -L "https://placehold.co/1200x630/ea580c/ffffff?text=Cybersecurity+Podcast" \
  -o "public/assets/images/cybersecurity-podcast.png"

# The Magician and Machine
curl -L "https://placehold.co/1200x630/4f46e5/ffffff?text=Magician+and+Machine" \
  -o "public/assets/images/magician-machine.png"

# SAP Licensing Optimization
curl -L "https://placehold.co/1200x630/059669/ffffff?text=License+Optimization" \
  -o "public/assets/images/license-optimization.png"

# What Actually Optimizes SAP Licenses
curl -L "https://placehold.co/1200x630/0891b2/ffffff?text=STAR+USMM+LAW+SLAW" \
  -o "public/assets/images/star-usmm-law-slaw.png"

echo "All blog images downloaded successfully!"
