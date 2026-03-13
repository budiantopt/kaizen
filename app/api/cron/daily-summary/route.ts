import { sendDailyDigestToUsers } from '@/app/actions/digest';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // 1. Validate Cron Secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // If testing locally without secret, you might want to bypass or check environment
        if (process.env.NODE_ENV !== 'production') {
            // Keep bypass for dev/testing, only enforce in prod
        } else {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    // 2. Process Digest
    try {
        const result = await sendDailyDigestToUsers();
        
        return NextResponse.json({
            success: true,
            message: "Daily digest sent successfully",
            timestamp: new Date().toISOString(),
            result
        });
    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
