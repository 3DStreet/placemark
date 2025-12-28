import { InfoCircledIcon } from "@radix-ui/react-icons";
import { DialogHeader } from "app/components/dialog";
import { Button, TextWell } from "app/components/elements";
import { useSetAtom } from "jotai";
import { dialogAtom } from "state/jotai";

export function AboutDialog() {
  const setDialogState = useSetAtom(dialogAtom);

  return (
    <div className="space-y-4">
      <DialogHeader title="About Placemark Play" titleIcon={InfoCircledIcon} />

      <div className="space-y-4 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Placemark Play on 3DStreet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A powerful GeoJSON editor for the web
          </p>
        </div>

        <TextWell>
          <p className="mb-2">
            This is a fork of{" "}
            <a
              href="https://github.com/placemark/placemark"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Placemark Play
            </a>
            , originally created by{" "}
            <a
              href="https://macwright.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Tom MacWright
            </a>{" "}
            and released under the MIT license.
          </p>
          <p className="mb-2">
            This version has been modified by{" "}
            <a
              href="https://3dstreet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              3DStreet
            </a>{" "}
            to integrate with the 3DStreet gallery for cloud storage of GeoJSON files.
          </p>
          <p>
            This fork is licensed under the{" "}
            <a
              href="https://www.gnu.org/licenses/agpl-3.0.en.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              AGPL-3.0 license
            </a>
            .
          </p>
        </TextWell>

        <div className="flex gap-4 justify-center">
          <a
            href="https://github.com/3DStreet/3dstreet-placemark"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="primary">View on GitHub</Button>
          </a>
          <a
            href="https://www.3dstreet.com/docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="quiet">3DStreet Docs</Button>
          </a>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Original Placemark Play by Tom MacWright (MIT License)</p>
          <p>3DStreet modifications (AGPL-3.0)</p>
        </div>
      </div>

      <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={() => setDialogState(null)}>Close</Button>
      </div>
    </div>
  );
}
