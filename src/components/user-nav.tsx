
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, CreditCard, Upload, Download } from "lucide-react";

type UserNavProps = {
  onImportClick: () => void;
  onExportClick: () => void;
  onManageCategoriesClick: () => void;
  onManageCreditCardsClick: () => void;
};

export function UserNav({ onImportClick, onExportClick, onManageCategoriesClick, onManageCreditCardsClick }: UserNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/03.png" alt="@shadcn" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Usuario</p>
            <p className="text-xs leading-none text-muted-foreground">
              usuario@ejemplo.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem onClick={onImportClick}>
            <Upload className="mr-2 h-4 w-4" />
            <span>Importar CSV</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={onExportClick}>
            <Download className="mr-2 h-4 w-4" />
            <span>Exportar CSV</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={onManageCategoriesClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Administrar Categorías</span>
          </DropdownMenuItem>
           <DropdownMenuItem onClick={onManageCreditCardsClick}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Administrar Tarjetas</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

    