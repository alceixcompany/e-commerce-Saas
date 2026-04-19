import { useEffect, useMemo } from 'react';
import { sanitizeHtml } from '@/lib/utils/safeHtml';

const TRUSTED_SCRIPT_HOSTS = new Set([
    'iyzipay.com',
    'www.iyzipay.com',
    'sandbox-static.iyzipay.com',
    'static.iyzipay.com',
    'iyzico.com',
    'www.iyzico.com',
]);

const TRUSTED_INLINE_PATTERNS = [
    /iyzi/i,
    /iyzipay/i,
    /checkoutform/i,
    /checkoutForm/i,
];

type TrustedScript = { src: string } | { inlineCode: string };

function isTrustedExternalScript(src: string) {
    try {
        const url = new URL(src, window.location.origin);
        return Array.from(TRUSTED_SCRIPT_HOSTS).some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
    } catch {
        return false;
    }
}

function isTrustedInlineScript(code: string) {
    const normalized = code.trim();
    return normalized.length > 0 && TRUSTED_INLINE_PATTERNS.some((pattern) => pattern.test(normalized));
}

function extractTrustedScripts(content: string) {
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const scripts = Array.from(doc.querySelectorAll('script'));

    return scripts
        .map((script) => {
            const src = script.getAttribute('src')?.trim();
            if (src) {
                return isTrustedExternalScript(src) ? { src } : null;
            }

            const inlineCode = script.textContent?.trim() || '';
            return isTrustedInlineScript(inlineCode) ? { inlineCode } : null;
        })
        .filter((script): script is TrustedScript => script !== null);
}

interface IyzicoFormProps {
    content: string;
}

export default function IyzicoForm({ content }: IyzicoFormProps) {
    const sanitizedMarkup = useMemo(() => sanitizeHtml(content), [content]);
    const trustedScripts = useMemo(() => extractTrustedScripts(content), [content]);

    useEffect(() => {
        if (trustedScripts.length > 0) {
            for (const scriptConfig of trustedScripts) {
                const newScript = document.createElement('script');

                if ('src' in scriptConfig) {
                    newScript.src = scriptConfig.src;
                    newScript.async = true;
                } else if ('inlineCode' in scriptConfig) {
                    newScript.text = scriptConfig.inlineCode;
                } else {
                    continue;
                }

                document.body.appendChild(newScript).parentNode?.removeChild(newScript);
            }
        }
    }, [trustedScripts]);

    if (!content) return null;

    return (
        <div className="mt-4" id="iyzipay-checkout-form">
            <div dangerouslySetInnerHTML={{ __html: sanitizedMarkup }} />
        </div>
    );
}
