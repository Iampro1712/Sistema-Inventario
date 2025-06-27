"use client";

import { useState, forwardRef } from "react";
import { Eye, EyeOff, RefreshCw, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { validatePasswordStrength, getPasswordStrengthLevel, generateTemporaryPassword } from "@/lib/password";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showStrengthIndicator?: boolean;
  showGenerateButton?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  onGenerate?: (password: string) => void;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    value, 
    onChange, 
    placeholder = "Ingresa una contraseña",
    label,
    showStrengthIndicator = true,
    showGenerateButton = false,
    required = false,
    disabled = false,
    className = "",
    onGenerate
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const validation = validatePasswordStrength(value);
    const strengthLevel = getPasswordStrengthLevel(value);

    const handleGenerate = async () => {
      setIsGenerating(true);
      
      // Simular un pequeño delay para la UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPassword = generateTemporaryPassword(12);
      onChange(newPassword);
      onGenerate?.(newPassword);
      
      setIsGenerating(false);
    };

    const getStrengthColor = (level: string) => {
      switch (level) {
        case 'weak': return 'bg-red-500';
        case 'medium': return 'bg-yellow-500';
        case 'strong': return 'bg-green-500';
        case 'very-strong': return 'bg-emerald-500';
        default: return 'bg-gray-300';
      }
    };

    const getStrengthWidth = (score: number) => {
      return `${(score / 5) * 100}%`;
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor="password-input">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            id="password-input"
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`pr-20 ${className}`}
            required={required}
            disabled={disabled}
          />
          
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
            {showGenerateButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleGenerate}
                disabled={disabled || isGenerating}
                title="Generar contraseña segura"
              >
                <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
            )}
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {showStrengthIndicator && value && (
          <div className="space-y-2">
            {/* Barra de fortaleza */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Fortaleza de la contraseña</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    strengthLevel.level === 'weak' ? 'border-red-500 text-red-700' :
                    strengthLevel.level === 'medium' ? 'border-yellow-500 text-yellow-700' :
                    strengthLevel.level === 'strong' ? 'border-green-500 text-green-700' :
                    'border-emerald-500 text-emerald-700'
                  }`}
                >
                  {strengthLevel.label}
                </Badge>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strengthLevel.level)}`}
                  style={{ width: getStrengthWidth(validation.score) }}
                />
              </div>
            </div>

            {/* Requisitos */}
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div className={`flex items-center gap-1 ${validation.requirements.minLength ? 'text-green-600' : 'text-red-600'}`}>
                {validation.requirements.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>8+ caracteres</span>
              </div>
              
              <div className={`flex items-center gap-1 ${validation.requirements.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                {validation.requirements.hasUppercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>Mayúscula</span>
              </div>
              
              <div className={`flex items-center gap-1 ${validation.requirements.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                {validation.requirements.hasLowercase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>Minúscula</span>
              </div>
              
              <div className={`flex items-center gap-1 ${validation.requirements.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                {validation.requirements.hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>Número</span>
              </div>
              
              <div className={`flex items-center gap-1 ${validation.requirements.hasSymbol ? 'text-green-600' : 'text-red-600'}`}>
                {validation.requirements.hasSymbol ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                <span>Símbolo</span>
              </div>
            </div>

            {/* Feedback */}
            {validation.feedback.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  {validation.feedback.map((feedback, index) => (
                    <li key={index}>{feedback}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
