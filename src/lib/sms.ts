export interface ComplaintSmsParams {
  mobileNumber: string;
  complaintCode: string;
  citizenName: string;
  areaStreet: string;
  category: string;
}

export interface SmsSendResult {
  sent: boolean;
  provider?: 'fast2sms' | 'msg91' | 'twilio' | 'webhook';
}

function buildComplaintSmsText(params: ComplaintSmsParams): string {
  const shortName = params.citizenName.trim().slice(0, 25);
  return `Namma Ward 65 Hubli: Dear ${shortName}, your complaint ${params.complaintCode} (${params.category}) is registered. Track at nammaward65hubli.in/track`;
}

export async function sendComplaintRegistrationSms(
  params: ComplaintSmsParams
): Promise<SmsSendResult> {
  const digits = params.mobileNumber.replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { sent: false };
  }

  const e164Indian = `+91${digits}`;
  const intlDigits = `91${digits}`;
  const message = buildComplaintSmsText(params);

  // 1. Fast2SMS (Popular Indian SMS Gateway)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY?.trim();
  if (fast2SmsKey) {
    try {
      const route = (process.env.FAST2SMS_ROUTE?.trim() || 'q').toLowerCase();
      const senderId = process.env.FAST2SMS_SENDER_ID?.trim();
      const templateId = process.env.FAST2SMS_TEMPLATE_ID?.trim();

      const payload =
        route === 'dlt' && senderId && templateId
          ? {
              route: 'dlt',
              sender_id: senderId,
              message: templateId,
              variables_values: `${params.complaintCode}|${params.category}`,
              flash: 0,
              numbers: digits,
            }
          : {
              route: 'q',
              message,
              flash: 0,
              numbers: digits,
            };

      const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const json = (await res.json().catch(() => null)) as {
          return?: boolean;
        } | null;
        if (json?.return !== false) {
          return { sent: true, provider: 'fast2sms' };
        }
      }
      console.error('Fast2SMS delivery returned non-OK status:', res.status);
    } catch (err) {
      console.error('Fast2SMS delivery failed:', err);
    }
  }

  // 2. MSG91 Flow API (Indian DLT SMS)
  const msg91Key = process.env.MSG91_AUTH_KEY?.trim();
  const msg91TemplateId = process.env.MSG91_TEMPLATE_ID?.trim();
  if (msg91Key && msg91TemplateId) {
    try {
      const res = await fetch('https://control.msg91.com/api/v5/flow', {
        method: 'POST',
        headers: {
          authkey: msg91Key,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          template_id: msg91TemplateId,
          short_url: '0',
          recipients: [
            {
              mobiles: intlDigits,
              name: params.citizenName,
              complaint_id: params.complaintCode,
              category: params.category,
              area: params.areaStreet,
              var1: params.complaintCode,
              var2: params.areaStreet,
            },
          ],
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        return { sent: true, provider: 'msg91' };
      }
      console.error('MSG91 delivery returned non-OK status:', res.status);
    } catch (err) {
      console.error('MSG91 delivery failed:', err);
    }
  }

  // 3. Twilio Programmable SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const twilioFrom = process.env.TWILIO_FROM_NUMBER?.trim();
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const credentials = Buffer.from(`${twilioSid}:${twilioToken}`).toString(
        'base64'
      );
      const formBody = new URLSearchParams({
        To: e164Indian,
        From: twilioFrom,
        Body: message,
      });

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(
          twilioSid
        )}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formBody.toString(),
          signal: AbortSignal.timeout(5000),
        }
      );

      if (res.ok) {
        return { sent: true, provider: 'twilio' };
      }
      console.error('Twilio delivery returned non-OK status:', res.status);
    } catch (err) {
      console.error('Twilio delivery failed:', err);
    }
  }

  // 4. Custom SMS Gateway Webhook
  const webhookUrl = process.env.SMS_WEBHOOK_URL?.trim();
  if (webhookUrl) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const webhookSecret = process.env.SMS_WEBHOOK_SECRET?.trim();
      if (webhookSecret) {
        headers.Authorization = `Bearer ${webhookSecret}`;
      }

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: e164Indian,
          mobile: digits,
          complaintCode: params.complaintCode,
          citizenName: params.citizenName,
          areaStreet: params.areaStreet,
          category: params.category,
          message,
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        return { sent: true, provider: 'webhook' };
      }
      console.error('SMS webhook returned non-OK status:', res.status);
    } catch (err) {
      console.error('SMS webhook delivery failed:', err);
    }
  }

  return { sent: false };
}
