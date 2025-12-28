import {
  ArrowRightIcon,
  CaretRightIcon,
  FilePlusIcon,
  FileIcon,
} from "@radix-ui/react-icons";
import {
  DDContent,
  DDLabel,
  DDSeparator,
  DDSubContent,
  DDSubTriggerItem,
  StyledItem,
  styledButton,
} from "app/components/elements";
import { useOpenFiles } from "app/hooks/use_open_files";
import { useImportString } from "app/hooks/use_import";
import { usePersistence } from "app/lib/persistence/context";
import { geojsonToString } from "app/lib/convert/local/geojson";
import { DEFAULT_EXPORT_GEOJSON_OPTIONS } from "app/lib/convert";
import { getExtent } from "app/lib/geometry";
import { MapContext } from "app/context/map_context";
import { useAtomValue, useSetAtom } from "jotai";
import { useContext } from "react";
import { DropdownMenu as DD } from "radix-ui";
import toast from "react-hot-toast";
import { dialogAtom, momentLogAtom, dataAtom, fileInfoAtom } from "state/jotai";
import type { LngLatBoundsLike, FeatureCollection } from "types";

// Declare the placemarkGallery bridge API type
declare global {
  interface Window {
    placemarkGallery?: {
      save: (geojsonData: object, title: string, metadata?: object) => Promise<string>;
      open: () => void;
      close: () => void;
      onFileSelected: ((geojsonData: object, metadata: object) => void) | null;
      isSignedIn: () => boolean;
    };
  }
}

function UndoList() {
  const rep = usePersistence();
  const historyControl = rep.useHistoryControl();
  const momentLog = useAtomValue(momentLogAtom);
  return (
    <DDSubContent>
      {momentLog.undo
        .map((moment, i) => {
          return (
            <StyledItem
              key={i}
              onSelect={async (_e) => {
                for (let j = 0; j < i + 1; j++) {
                  await historyControl("undo");
                }
              }}
            >
              <ArrowRightIcon className="opacity-0" />
              {moment.note || ""}
            </StyledItem>
          );
        })
        .reverse()}
      <DDLabel>
        <div className="flex items-center gap-x-2">
          <ArrowRightIcon />
          Current state
        </div>
      </DDLabel>
      {momentLog.redo.map((moment, i) => {
        return (
          <StyledItem
            key={i}
            onSelect={async (_e) => {
              for (let j = 0; j < i + 1; j++) {
                await historyControl("redo");
              }
            }}
          >
            <ArrowRightIcon className="opacity-0" />
            {moment.note || ""}
          </StyledItem>
        );
      })}
    </DDSubContent>
  );
}

export function MenuBarDropdown() {
  const openFiles = useOpenFiles();
  const setDialogState = useSetAtom(dialogAtom);
  const data = useAtomValue(dataAtom);
  const fileInfo = useAtomValue(fileInfoAtom);
  const rep = usePersistence();
  const transact = rep.useTransact();
  const importString = useImportString();
  const map = useContext(MapContext);

  // Get current filename from fileInfo or default
  const currentFileName = fileInfo?.handle?.name || "untitled.geojson";

  // Handler for New - clears the current document and zooms to world view
  const handleNew = async () => {
    if (data.featureMap.size > 0) {
      // Clear all features by deleting them
      await transact({
        note: "New document",
        deleteFeatures: Array.from(data.featureMap.keys()),
      });
    }
    // Zoom out to world view
    map?.map.fitBounds([[-180, -60], [180, 70]] as LngLatBoundsLike, {
      padding: 50,
      animate: true,
    });
    toast.success("New document created");
  };

  // Handler for Open from 3DStreet Gallery
  const handleOpenFromGallery = () => {
    if (!window.placemarkGallery) {
      toast.error("Gallery not available");
      return;
    }
    if (!window.placemarkGallery.isSignedIn()) {
      toast.error("Please sign in to access your gallery");
      return;
    }

    // Set up the callback for when a file is selected
    window.placemarkGallery.onFileSelected = async (geojsonData: object, metadata: object) => {
      try {
        const geojsonString = JSON.stringify(geojsonData);
        const result = await importString(
          geojsonString,
          { type: "geojson" },
          () => {}, // progress callback
          (metadata as { title?: string }).title || "Imported from gallery"
        );
        // importString returns an Either - check if it's an error (Left)
        if (result.isLeft()) {
          const error = result.extract();
          toast.error((error as Error)?.message || "Failed to import file");
        } else {
          // Zoom to the imported features
          const extent = getExtent(geojsonData as FeatureCollection);
          extent.ifJust((bounds) => {
            map?.map.fitBounds(bounds as LngLatBoundsLike, {
              padding: 100,
              animate: true,
            });
          });
          toast.success("Loaded from gallery");
        }
      } catch (error) {
        console.error("Failed to load from gallery:", error);
        toast.error("Failed to load file");
      }
    };

    window.placemarkGallery.open();
  };

  // Handler for Save to 3DStreet Gallery
  const handleSaveToGallery = async () => {
    if (!window.placemarkGallery) {
      toast.error("Gallery not available");
      return;
    }
    if (!window.placemarkGallery.isSignedIn()) {
      toast.error("Please sign in to save to gallery");
      return;
    }

    try {
      const geojsonString = geojsonToString(data.featureMap, DEFAULT_EXPORT_GEOJSON_OPTIONS);
      const geojsonData = JSON.parse(geojsonString);

      await window.placemarkGallery.save(geojsonData, currentFileName, {
        source: "placemark-play",
        featureCount: geojsonData.features?.length || 0,
      });
      toast.success("Saved to gallery");
    } catch (error) {
      console.error("Failed to save to gallery:", error);
      toast.error("Failed to save");
    }
  };

  return (
    <div className="flex items-center">
      <DD.Root>
        <DD.Trigger className={styledButton({ size: "sm", variant: "quiet" })}>
          <span>File</span>
        </DD.Trigger>
        <DD.Portal>
          <DDContent>
            {/* New */}
            <StyledItem onSelect={handleNew}>
              <FilePlusIcon className="mr-2" />
              New
            </StyledItem>

            <DDSeparator />

            {/* Open from Gallery */}
            <StyledItem onSelect={handleOpenFromGallery}>
              <FileIcon className="mr-2" />
              Open from Gallery
            </StyledItem>

            {/* Save to Gallery */}
            <StyledItem onSelect={handleSaveToGallery}>
              Save to Gallery
            </StyledItem>

            <DDSeparator />

            {/* Import submenu */}
            <DD.Sub>
              <DDSubTriggerItem>
                Import
                <div className="flex-auto" />
                <CaretRightIcon />
              </DDSubTriggerItem>
              <DDSubContent>
                <StyledItem
                  onSelect={() => {
                    return openFiles();
                  }}
                >
                  Import file
                </StyledItem>
                <StyledItem
                  onSelect={() => {
                    setDialogState({
                      type: "load_text",
                    });
                  }}
                >
                  Paste text
                </StyledItem>
                <StyledItem
                  onSelect={() => {
                    setDialogState({
                      type: "from_url",
                    });
                  }}
                >
                  From URL
                </StyledItem>
                <StyledItem
                  onSelect={() => {
                    setDialogState({
                      type: "import_example",
                    });
                  }}
                >
                  Data library
                </StyledItem>
              </DDSubContent>
            </DD.Sub>

            {/* Export */}
            <StyledItem
              onSelect={() => {
                setDialogState({ type: "export" });
              }}
            >
              Export
            </StyledItem>
            <StyledItem
              onSelect={() => {
                setDialogState({ type: "export-svg" });
              }}
            >
              Export SVG
            </StyledItem>

            <DDSeparator />

            {/* Undo history */}
            <DD.Sub>
              <DDSubTriggerItem>
                Undo history
                <div className="flex-auto" />
                <CaretRightIcon />
              </DDSubTriggerItem>
              <UndoList />
            </DD.Sub>
          </DDContent>
        </DD.Portal>
      </DD.Root>
    </div>
  );
}
