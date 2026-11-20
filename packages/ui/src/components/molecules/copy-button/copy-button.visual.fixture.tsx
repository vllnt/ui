import { copyText } from "../../../lib/copy-text";
import { Button } from "../../atoms/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../atoms/dropdown-menu/dropdown-menu";

export function CopyFromMenuPreview({ value }: { value: string }) {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => {
              void copyText(value);
            }}
          >
            Copy key
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <textarea aria-label="Paste target" />
    </>
  );
}
