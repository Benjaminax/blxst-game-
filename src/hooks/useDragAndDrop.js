import { useState, useCallback, useEffect } from 'react';

export function useDragAndDrop() {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    dragPosition: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    dropTarget: null,
    isValidDrop: false
  });

  const updateDragPosition = useCallback((clientX, clientY) => {
    setDragState(prev => ({
      ...prev,
      dragPosition: { 
        x: clientX - prev.dragOffset.x, 
        y: clientY - prev.dragOffset.y 
      }
    }));
  }, []);

  const startDrag = useCallback((item, event) => {
    event.preventDefault();
    
    // Get pointer position (mouse or touch)
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Calculate offset from element center
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // On mobile, offset drag ghost so it's visible above finger
    const isMobile = event.touches !== undefined;
    // Calculate dynamic offset based on viewport height for better mobile experience
    const viewportHeight = window.innerHeight;
    const dynamicOffset = isMobile ? Math.max(120, viewportHeight * 0.15) : 0;
    const offsetY = dynamicOffset;
    
    setDragState({
      isDragging: true,
      draggedItem: item,
      dragPosition: { x: centerX, y: centerY - offsetY },
      dragOffset: { 
        x: clientX - centerX, 
        y: clientY - centerY + offsetY 
      },
      dropTarget: null,
      isValidDrop: false
    });
  }, []);

  const updateDrag = useCallback((event) => {
    if (!dragState.isDragging) return;
    
    event.preventDefault();
    
    // Get pointer position
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    updateDragPosition(clientX, clientY);
  }, [dragState.isDragging, updateDragPosition]);

  const endDrag = useCallback((event) => {
    if (!dragState.isDragging) return;
    
    event.preventDefault();
    
    // Get final position
    const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
    
    // Find drop target at this position
    const elementBelow = document.elementFromPoint(clientX, clientY);
    const dropTarget = elementBelow?.closest('[data-drop-target]');
    
    const finalState = {
      ...dragState,
      dropTarget,
      finalPosition: { x: clientX, y: clientY }
    };
    
    // Reset drag state
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragPosition: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      dropTarget: null,
      isValidDrop: false
    });
    
    return finalState;
  }, [dragState]);

  const updateDropTarget = useCallback((target, isValid) => {
    setDragState(prev => ({
      ...prev,
      dropTarget: target,
      isValidDrop: isValid
    }));
  }, []);

  // Set up global event listeners for drag
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleGlobalMove = (e) => {
      // Prevent scrolling on mobile during drag
      if (e.touches) {
        e.preventDefault();
      }
      updateDrag(e);
    };

    const handleGlobalEnd = (e) => {
      endDrag(e);
    };

    // Add listeners for both mouse and touch
    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('touchmove', handleGlobalMove, { passive: false });
    document.addEventListener('mouseup', handleGlobalEnd);
    document.addEventListener('touchend', handleGlobalEnd);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalEnd);
      document.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [dragState.isDragging, updateDrag, endDrag]);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    updateDropTarget
  };
}
