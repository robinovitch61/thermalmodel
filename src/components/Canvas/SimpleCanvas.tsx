import * as React from "react";
import { useCallback, useLayoutEffect, useRef } from "react";
import styled from "styled-components";
import { AppConnection, AppNode } from "../App";
import {
  drawCircle,
  drawConnection,
  intersectsCircle,
  mouseToNodeCoords,
} from "./canvasUtils";
import config from "../../config";
import usePanZoomCanvas from "./hooks/usePanZoomCanvas";
import { diffPoints, makePoint, scalePoint } from "./pointUtils";
import { makeNode } from "hotstuff-network";
import useNodeMove from "./hooks/useNodeMove";

const StyledCanvasWrapper = styled.div`
  display: block;
  max-height: 100%;
  position: relative;
`;

const StyledControls = styled.div`
  z-index: 10;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 0.5em;

  > button {
    padding: 0.5em;
  }
`;

const StyledCanvas = styled.canvas<{ cssWidth: number; cssHeight: number }>`
  border: 1px solid red;
  width: ${({ cssWidth }) => `${cssWidth}px`};
  height: ${({ cssHeight }) => `${cssHeight}px`};
`;

const { newNodeNamePrefix, defaultNodeRadius } = config;

export type SimpleCanvasProps = {
  nodes: AppNode[];
  connections: AppConnection[];
  setAppNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
  canvasWidth: number;
  canvasHeight: number;
  devicePixelRatio: number;
};

export default function SimpleCanvas(
  props: SimpleCanvasProps
): React.ReactElement {
  // destructure props
  const {
    nodes,
    connections,
    canvasHeight,
    canvasWidth,
    devicePixelRatio,
    setAppNodes,
  } = props;

  // hooks
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [
    context,
    reset,
    viewportTopLeft,
    offset,
    scale,
    startPan,
  ] = usePanZoomCanvas(canvasRef, canvasWidth, canvasHeight);
  const [nodeDelta, startNodeMove] = useNodeMove();

  // node updaters
  const addNode = useCallback(
    (node: AppNode) => {
      const newNodes: AppNode[] = nodes.map((node) => ({
        ...node,
        isActive: false,
      }));
      newNodes.push({ ...node, isActive: true });
      setAppNodes(newNodes);
    },
    [nodes, setAppNodes]
  );

  const updateNodes = useCallback(
    (nodesToUpdate: AppNode[]) => {
      const nodeIdsToUpdate = nodesToUpdate.map((node) => node.id);
      const newNodes = nodes.map((node) =>
        nodeIdsToUpdate.includes(node.id)
          ? nodesToUpdate.filter((up) => up.id === node.id)[0]
          : node
      );
      setAppNodes(newNodes);
    },
    [nodes, setAppNodes]
  );

  const updateActiveNodes = useCallback(
    (activeNodeId: string, sticky: boolean) => {
      setAppNodes(
        nodes.map((node) => ({
          ...node,
          isActive:
            node.id === activeNodeId ? true : sticky ? node.isActive : false,
        }))
      );
    },
    [nodes, setAppNodes]
  );

  const clearActiveNodes = useCallback(() => {
    setAppNodes(
      nodes.map((node) => ({
        ...node,
        isActive: false,
      }))
    );
  }, [nodes, setAppNodes]);

  function handleDoubleClick(
    event: React.MouseEvent<HTMLCanvasElement>,
    nodes: AppNode[]
  ) {
    const numNewNodes = nodes.filter((node) =>
      node.name.startsWith(newNodeNamePrefix)
    ).length;
    const newNode = makeNode({
      name:
        numNewNodes === 0
          ? `${newNodeNamePrefix}`
          : `${newNodeNamePrefix} (${numNewNodes + 1})`,
      temperatureDegC: 0,
      capacitanceJPerDegK: 0,
      powerGenW: 0,
      isBoundary: false,
    });
    const newAppNode = {
      ...newNode,
      center: mouseToNodeCoords(
        makePoint(event.clientX, event.clientY),
        offset,
        viewportTopLeft,
        scale
      ),
      radius: defaultNodeRadius,
      color: "red",
      isActive: false,
    };
    addNode(newAppNode);
  }

  function handleOnMouseDown(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }

    let nodeClicked = false;
    nodes.some((node) => {
      if (
        intersectsCircle(
          mouseToNodeCoords(
            makePoint(event.clientX, event.clientY),
            offset,
            viewportTopLeft,
            scale
          ),
          node.center,
          node.radius
        )
      ) {
        nodeClicked = true;
        const sticky =
          event.shiftKey || nodes.filter((node) => node.isActive).length > 1;
        updateActiveNodes(node.id, sticky);
        if (event.altKey) {
          alert("MAKE CONNECTION TODO");
          // startMakeConnection(event);
        } else {
          startNodeMove(event);
        }
        return true; // short circuits the rest of the some loop
      }
    });

    if (!nodeClicked) {
      clearActiveNodes();
      startPan(event);
    }
  }

  // setup canvas and set context
  useLayoutEffect(() => {
    if (canvasRef.current) {
      // get new drawing context
      const renderCtx = canvasRef.current.getContext("2d");
      if (renderCtx) {
        reset(renderCtx);
      }
    }
  }, [reset, canvasHeight, canvasWidth, canvasRef, context]);

  // draw
  useLayoutEffect(() => {
    if (context) {
      // clear canvas but maintain transform
      const storedTransform = context.getTransform();
      context.canvas.width = context.canvas.width;
      context.setTransform(storedTransform);

      nodes.map((node) => {
        const { x, y } = node.center;
        drawCircle(context, x, y, node.radius, node.color, node.isActive);
      });

      connections.map((conn) => {
        const { source, target } = conn;
        // TODO: Smarter way to do this?
        const sourceAppNode = nodes.filter((node) => node.id === source.id)[0];
        const targetAppNode = nodes.filter((node) => node.id === target.id)[0];
        drawConnection(context, sourceAppNode.center, targetAppNode.center);
      });
    }
  }, [
    canvasWidth,
    canvasHeight,
    context,
    scale,
    offset,
    viewportTopLeft,
    nodes,
    connections,
  ]);

  // move active nodes if click and drag
  useLayoutEffect(() => {
    const activeNodes = nodes.filter((node) => node.isActive);
    if (activeNodes.length === 0) {
      return;
    }
    const newActiveNodes = activeNodes.map((activeNode) => ({
      ...activeNode,
      isActive: true,
      center: diffPoints(activeNode.center, scalePoint(nodeDelta, scale)),
    }));

    updateNodes(newActiveNodes);
  }, [nodeDelta]); // incomplete deps array here but infinite loop otherwise...

  return (
    <StyledCanvasWrapper>
      <StyledControls>
        <pre>scale: {scale}</pre>
        <pre>offset: {JSON.stringify(offset)}</pre>
        <pre>viewportTopLeft: {JSON.stringify(viewportTopLeft)}</pre>
        <button onClick={() => context && reset(context)}>
          Reset Viewport
        </button>
      </StyledControls>
      <StyledCanvas
        ref={canvasRef}
        width={canvasWidth * devicePixelRatio}
        height={canvasHeight * devicePixelRatio}
        cssWidth={canvasWidth}
        cssHeight={canvasHeight}
        onMouseDown={handleOnMouseDown}
        onDoubleClick={(event: React.MouseEvent<HTMLCanvasElement>) => {
          const canvas = canvasRef.current;
          if (canvas === null) {
            return;
          }
          handleDoubleClick(event, nodes);
        }}
      />
    </StyledCanvasWrapper>
  );
}
