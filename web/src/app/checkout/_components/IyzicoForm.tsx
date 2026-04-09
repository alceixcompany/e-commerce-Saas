import { useEffect } from 'react';

interface IyzicoFormProps {
    content: string;
}

export default function IyzicoForm({ content }: IyzicoFormProps) {
    useEffect(() => {
        if (content) {
            const scriptElements = document.getElementById('iyzipay-checkout-form')?.getElementsByTagName('script');
            if (scriptElements && scriptElements.length > 0) {
                for (let i = 0; i < scriptElements.length; i++) {
                    const newScript = document.createElement('script');
                    newScript.text = scriptElements[i].text;
                    document.body.appendChild(newScript).parentNode?.removeChild(newScript);
                }
            }
        }
    }, [content]);

    if (!content) return null;

    return (
        <div className="mt-4" id="iyzipay-checkout-form">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}
