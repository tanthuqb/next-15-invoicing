# Uploads production env vars from .env.local to Vercel, then redeploys.
# Run this from YOUR OWN terminal (not inside an AI agent session):
#   powershell -ExecutionPolicy Bypass -File scripts\upload-env-to-vercel.ps1
# Vercel CLI redacts secrets to "[SENSITIVE]" when it detects an AI agent,
# so this script must be run by a human.

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$envFile = Join-Path $root ".env.local"

$map = @{}
foreach ($line in [System.IO.File]::ReadAllLines($envFile)) {
  if ($line -match '^\s*#' -or $line -notmatch '=') { continue }
  $p = $line -split '=', 2
  $map[$p[0].Trim()] = $p[1].Trim()
}

$names = @(
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
)

foreach ($n in $names) {
  if ([string]::IsNullOrWhiteSpace($map[$n])) { Write-Host "SKIP (empty): $n"; continue }
  $map[$n] | vercel env add $n production --force
  Write-Host "uploaded: $n"
}

# Production webhook secret comes from the Stripe Dashboard endpoint,
# stored locally under the STRIPE_WEBHOOK_SECRET_PRODUCT reference name.
if ([string]::IsNullOrWhiteSpace($map['STRIPE_WEBHOOK_SECRET_PRODUCT'])) {
  Write-Host "WARNING: STRIPE_WEBHOOK_SECRET_PRODUCT is empty in .env.local - webhook secret NOT uploaded"
} else {
  $map['STRIPE_WEBHOOK_SECRET_PRODUCT'] | vercel env add STRIPE_WEBHOOK_SECRET production --force
  Write-Host "uploaded: STRIPE_WEBHOOK_SECRET (from _PRODUCT)"
}

Write-Host "`nRedeploying production..."
vercel --prod --yes

Write-Host "`nDone. Verify with:"
Write-Host "  curl -X POST https://next-15-invoicing.vercel.app/api/webhook/stripe"
Write-Host "  (expect: 400 'Webhook Error: No stripe-signature header value was provided')"
