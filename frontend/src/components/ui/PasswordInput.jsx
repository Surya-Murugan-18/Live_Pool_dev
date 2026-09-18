import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Input } from './Input';
export function PasswordInput({ label, error, hint, ...rest }) {
    const [visible, setVisible] = useState(false);
    const Icon = visible ? EyeOffIcon : EyeIcon;
    return (<Input {...rest} label={label} error={error} hint={hint} type={visible ? 'text' : 'password'} trailing={<button type="button" onClick={() => setVisible((prev) => !prev)} aria-label={visible ? 'Hide password' : 'Show password'} className="flex h-9 w-9 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 ease-swift hover:bg-brand-50 hover:text-ink">
        
          <Icon className="h-4 w-4" aria-hidden="true"/>
        </button>}/>);
}
