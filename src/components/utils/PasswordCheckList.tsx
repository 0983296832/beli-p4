import React, { useEffect, useState } from 'react';

interface CustomIconComponents {
  ValidIcon: React.ReactNode;
  InvalidIcon: React.ReactNode;
}

interface PasswordProps {
  value: string;
  valueAgain?: string;
  minLength?: number;
  maxLength?: number;
  iconSize?: number;
  validColor?: string;
  invalidColor?: string;
  onChange?: (isValid: boolean) => any;
  messages?: {
    [key in RuleNames]?: string;
  };
  iconComponents?: CustomIconComponents;
}

export type RuleNames = 'notEmpty' | 'minLength' | 'specialCharAndNumber' | 'capitalAndLowercase';

export interface ReactPasswordChecklistProps extends PasswordProps {
  className?: string;
  style?: React.CSSProperties;
  rules: Array<RuleNames>;
  rtl?: boolean;
}

const ReactPasswordChecklist: React.FC<ReactPasswordChecklistProps> = ({
  className = 'list-unstyled',
  style,
  rules,
  value,
  valueAgain,
  onChange,
  messages = {},
  ...remainingProps
}) => {
  const [isValid, setIsValid] = useState(false);

  const ruleDefinitions: {
    [key in RuleNames]: { valid: boolean; message: string };
  } = {
    notEmpty: {
      valid: value.length > 0,
      message: messages.notEmpty || 'Mật khẩu không được để trống.'
    },
    minLength: {
      valid: value.length >= 8,
      message: messages.minLength || 'Mật khẩu chứa ít nhất 8 ký tự.'
    },
    specialCharAndNumber: {
      valid: /[0-9]/.test(value) && /[!@#$&*]/.test(value),
      message: messages.specialCharAndNumber || 'Mật khẩu chứa ít nhất một số và một ký tự đặc biệt.'
    },
    capitalAndLowercase: {
      valid: /[a-z]/.test(value) && /[A-Z]/.test(value),
      message: messages.capitalAndLowercase || 'Mật khẩu bao gồm cả chữ hoa và chữ thường.'
    }
  };

  const enabledRules = rules.filter((rule) => Boolean(ruleDefinitions[rule]));

  useEffect(() => {
    if (enabledRules.every((rule) => ruleDefinitions[rule].valid)) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [value]);

  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(isValid);
    }
  }, [isValid]);

  return (
    <ul className={className} style={style}>
      {enabledRules.map((rule) => {
        const { message, valid } = ruleDefinitions[rule];
        return (
          <Rule key={rule} valid={valid} {...remainingProps}>
            {message}
          </Rule>
        );
      })}
    </ul>
  );
};

interface RuleProps {
  valid: boolean;
  children?: React.ReactNode;
}

const Rule: React.FC<RuleProps> = ({ valid, children }) => {
  return (
    <li
      className={`${valid ? 'valid' : 'invalid text-primary-error'} ${children === 'Xác nhận trùng khớp.' ? 'mt-2' : ''}`}
    >
      <span>{children}</span>
    </li>
  );
};

export default ReactPasswordChecklist;
