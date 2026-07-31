export interface StudentSignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  githubUrl: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: keyof StudentSignupFormData;
  error?: string;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  helperText?: string;
}

export interface PasswordInputProps extends Omit<FormInputProps, 'type'> {
  showStrengthIndicator?: boolean;
}
