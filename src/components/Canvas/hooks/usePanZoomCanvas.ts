import * as React from "react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import {
  addPoints,
  diffPoints,
  ORIGIN,
  Point,
  scalePoint,
} from "../../../utils/pointUtils";
import config from "../../../config";
import { calculateCanvasMouse } from "../canvasUtils";
import useLocalStorageState from "../../../hooks/useLocalStorageState";

const { maxZoom, minZoom, zoomSensitivity } = config;

export default function usePanZoomCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement>
): [
  CanvasRenderingContext2D | null,
  React.Dispatch<React.SetStateAction<CanvasRenderingContext2D | null>>,
  (offset: Point, scale: number) => void,
  Point,
  number,
  (event: React.MouseEvent | MouseEvent) => void
] {
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [scale, setScale] = useLocalStorageState<number>(1, "hotstuffScale");
  const [offset, setOffset] = useLocalStorageState<Point>(
    ORIGIN,
    "hotstuffOffset"
  );
  const mousePosRef = useRef<Point>(ORIGIN);
  const lastMousePosRef = useRef<Point>(ORIGIN);

  const setView = useCallback(
    (offset: Point, scale: number) => {
      setOffset(offset);
      setScale(scale);
    },
    [setOffset, setScale]
  );

  // functions for panning
  const mouseMove = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (context) {
        // update mouse position
        const newMousePos = calculateCanvasMouse(event, context.canvas);
        lastMousePosRef.current = mousePosRef.current;
        mousePosRef.current = newMousePos;

        const mouseDiff = scalePoint(
          diffPoints(mousePosRef.current, lastMousePosRef.current),
          scale
        );
        setOffset((prevOffset) => addPoints(prevOffset, mouseDiff));
      }
    },
    [context, scale, setOffset]
  );

  const mouseUp = useCallback(() => {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mouseup", mouseUp);
  }, [mouseMove]);

  const startPan = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      if (context) {
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("mouseup", mouseUp);
        mousePosRef.current = calculateCanvasMouse(event, context.canvas);
      }
    },
    [context, mouseMove, mouseUp]
  );

  // add event listener on canvas for zoom
  useLayoutEffect(() => {
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
      if (context) {
        // update mouse position
        const newMousePos = calculateCanvasMouse(event, context.canvas);
        lastMousePosRef.current = mousePosRef.current;
        mousePosRef.current = newMousePos;

        // calculate new scale/zoom
        const zoom = 1 - event.deltaY / zoomSensitivity;
        const newScale = scale * zoom;
        if (newScale > maxZoom || newScale < minZoom) {
          return;
        }

        // offset the canvas such that the point under the mouse doesn't move
        const lastMouse = scalePoint(mousePosRef.current, scale);
        const newMouse = scalePoint(mousePosRef.current, newScale);
        const mouseOffset = diffPoints(lastMouse, newMouse);

        setOffset(diffPoints(offset, mouseOffset));
        setScale(newScale);
      }
    }

    const canvasElem = canvasRef.current;
    if (canvasElem) {
      canvasElem.addEventListener("wheel", handleWheel);
      return () => canvasElem.removeEventListener("wheel", handleWheel);
    }
  }, [canvasRef, context, offset, scale, setOffset, setScale]);

  return [context, setContext, setView, offset, scale, startPan];
}
