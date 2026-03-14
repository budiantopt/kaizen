'use server'

import { getSetting } from '@/app/actions/settings'
import { DigestToggleClient } from '@/components/admin/DigestToggleClient'

export async function DigestToggle() {
    const enabled = await getSetting('digest_email_enabled')
    // Default to true if not set
    const isEnabled = enabled === null ? true : !!enabled

    return <DigestToggleClient initialEnabled={isEnabled} />
}
