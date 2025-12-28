import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  KeyboardIcon,
  ReaderIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { FileInfo } from "app/components/file_info";
import { useSetAtom } from "jotai";
import { DropdownMenu as DD } from "radix-ui";
import { memo } from "react";
import { dialogAtom } from "state/jotai";
import { Button, DDContent, StyledItem } from "./elements";
import { MenuBarDropdown } from "./menu_bar/menu_bar_dropdown";

export const MenuBarPlay = memo(function MenuBar() {
  return (
    <div className="flex justify-between h-12 pr-2 text-black dark:text-white">
      <div className="flex items-center gap-x-1">
        {/* 3DStreet AppSwitcher mount point - replaces logo */}
        <div id="app-switcher-root" className="flex items-center" />

        {/* File and Help menus */}
        <MenuBarDropdown />
        <HelpDot />

        {/* Filename display */}
        <FileInfo />
      </div>
      <div className="flex items-center gap-x-2">
        {/* GitHub link */}
        <a
          href="https://github.com/3DStreet/3dstreet-placemark"
          className="text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm bg-purple-100 px-2 py-1 rounded"
        >
          <GitHubLogoIcon />
          Open Source
        </a>

        {/* 3DStreet Auth mount point */}
        <div id="auth-root" className="flex items-center" />
      </div>
    </div>
  );
});

function HelpDot() {
  const setDialogState = useSetAtom(dialogAtom);
  return (
    <DD.Root>
      <DD.Trigger asChild>
        <Button variant="quiet">Help</Button>
      </DD.Trigger>
      <DDContent>
        <StyledItem
          onSelect={() => {
            setDialogState({ type: "about" });
          }}
        >
          <InfoCircledIcon />
          About
        </StyledItem>
        <StyledItem
          onSelect={() => {
            setDialogState({ type: "cheatsheet" });
          }}
        >
          <KeyboardIcon />
          Keyboard shorcuts
        </StyledItem>
        <StyledItem
          onSelect={() => {
            window.open("https://www.placemark.io/documentation-index");
          }}
        >
          <ReaderIcon /> Documentation
        </StyledItem>
        <StyledItem
          onSelect={() => {
            window.open("https://confirmsubscription.com/h/y/13501B63095BB913");
          }}
        >
          <EnvelopeClosedIcon /> Sign up for updates
        </StyledItem>
      </DDContent>
    </DD.Root>
  );
}
