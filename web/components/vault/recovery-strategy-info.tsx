'use client'

import { AlertCircle, CheckCircle2, Download, Shield } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function RecoveryStrategyWarning() {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Master Password Cannot Be Recovered</AlertTitle>
      <AlertDescription className="mt-2 space-y-2 text-sm">
        <p>
          Your master password is the encryption key to your entire vault. If you forget it, your vault data becomes permanently inaccessible unless you have an encrypted backup.
        </p>
        <p>
          <strong>Important:</strong> We cannot reset your master password—no recovery email, no security questions, no backdoor.
        </p>
      </AlertDescription>
    </Alert>
  )
}

export function RecoveryStrategyGuide() {
  return (
    <Card className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-4 w-4" aria-hidden />
          Password Safety Best Practices
        </CardTitle>
        <CardDescription>Protect your vault from permanent data loss</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Master Password */}
        <div className="space-y-2 rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Master Password</h4>
              <p className="text-xs text-muted-foreground mt-1">
                The ONLY key to your entire vault. If lost, vault is unrecoverable.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-3 list-disc">
                <li>Use a strong, unique passphrase you won&apos;t forget</li>
                <li>Do NOT store it digitally (no notes, password managers, emails)</li>
                <li>Do NOT share it with anyone, including support staff</li>
                <li>Change it every 6 months for security</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Encrypted Backup */}
        <div className="space-y-2 rounded-lg border border-green-200 bg-white p-3 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" aria-hidden />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Encrypted Backup Export</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Only way to recover if you lose your master password or Google account.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-3 list-disc">
                <li>Export monthly from Settings → Backup & Restore</li>
                <li>Use a strong passphrase different from master password</li>
                <li>Store exports in 2+ locations: cloud storage + USB backup</li>
                <li>Encrypted exports cannot be decrypted without passphrase</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Master PIN */}
        <div className="space-y-2 rounded-lg border border-amber-200 bg-white p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="flex-1">
              <h4 className="font-semibold text-sm">Master PIN (Secondary Auth)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Fallback login if you lose access to Google 2FA.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-3 list-disc">
                <li>Set up during first login</li>
                <li>Can use instead of Google Sign-In</li>
                <li>If you forget Master PIN, you can reset via Google account</li>
                <li>Note: Still cannot recover if BOTH master password AND Google are inaccessible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/20">
          <p className="text-xs text-muted-foreground mb-2">
            <strong>Next Steps:</strong>
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" aria-hidden />
              Download Encrypted Backup
            </Button>
            <Button variant="outline" size="sm">
              View Full Recovery Guide
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecoveryFAQ() {
  const faqs = [
    {
      q: 'I forgot my master password. Can I recover my vault?',
      a: 'No, unless you have an encrypted backup export saved before forgetting it. This is intentional for security—there is no backdoor.',
    },
    {
      q: 'What if I lose Google 2FA access?',
      a: 'Use your Master PIN to log in instead. You can then reset Google 2FA or export your vault.',
    },
    {
      q: 'What if I lose both master password AND Google access?',
      a: 'Only recoverable with: (1) Master PIN, or (2) Encrypted backup export with passphrase. Otherwise, vault is inaccessible.',
    },
    {
      q: 'Can support staff help recover my password?',
      a: 'No. We implement true end-to-end encryption—we never see your master password or encryption key.',
    },
    {
      q: 'Is this more secure than other password managers?',
      a: 'Yes. Other managers offer password recovery, which creates a security backdoor. We chose security over convenience.',
    },
    {
      q: 'Can I request my encrypted data from you?',
      a: 'Yes, contact support for a data export. Your vault will be encrypted—we cannot decrypt it for you.',
    },
  ]

  return (
    <div className="space-y-3 mt-4">
      <h3 className="font-semibold text-base">Frequently Asked Questions</h3>
      {faqs.map((faq, idx) => (
        <details key={idx} className="group cursor-pointer rounded-lg border p-3 hover:bg-muted/50">
          <summary className="flex items-center justify-between font-medium text-sm">
            <span>{faq.q}</span>
            <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <p className="text-xs text-muted-foreground mt-3">{faq.a}</p>
        </details>
      ))}
    </div>
  )
}
