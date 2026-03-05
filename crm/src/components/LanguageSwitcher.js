import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const LANGUAGES = {
    en: 'English',
    hi: 'हिंदी (Hindi)',
    mr: 'मराठी (Marathi)',
    gu: 'ગુજરાતી (Gujarati)',
    bn: 'বাংলা (Bengali)',
    ta: 'தமிழ் (Tamil)',
};

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium hidden sm:inline-block">
                        {LANGUAGES[i18n.language] || 'English'}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {Object.entries(LANGUAGES).map(([code, label]) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => changeLanguage(code)}
                        className={i18n.language === code ? "bg-accent" : ""}
                    >
                        {label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
