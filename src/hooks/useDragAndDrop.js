import { useState, useCallback, useEffect, useRef } from 'react';

export function useDragAndDrop() {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    dragPosition: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    dropTarget: null,
    isValidDrop: false
  });

  // Use ref to track drag state for performance
  const dragStateRef = useRef(dragState);
  dragStateRef.current = dragState;

  const updateDragPosition = useCallback((clientX, clientY) => {
    if (!dragStateRef.current.isDragging) return;
    
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
    
    // On mobile, offset drag ghost so it's visible above finger - increased offset
    const isMobile = event.touches !== undefined;
    const offsetY = isMobile ? 120 : 0; // Increased from 60 to 120 for better visibility
    const offsetX = isMobile ? 20 : 0; // Added slight horizontal offset
    
    const newDragState = {
      isDragging: true,
      draggedItem: item,
      dragPosition: { x: centerX + offsetX, y: centerY - offsetY },
      dragOffset: { 
        x: clientX - centerX - offsetX, 
        y: clientY - centerY + offsetY 
      },
      dropTarget: null,
      isValidDrop: false
    };
    
    setDragState(newDragState);
    dragStateRef.current = newDragState;
    
    // Add haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, []);

  const updateDrag = useCallback((event) => {
    if (!dragStateRef.current.isDragging) return;
    
    event.preventDefault();
    
    // Get pointer position
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Use requestAnimationFrame for smooth animation
    requestAnimationFrame(() => {
      updateDragPosition(clientX, clientY);
    });
  }, [updateDragPosition]);

  const endDrag = useCallback((event) => {
    if (!dragStateRef.current.isDragging) return;
    
    event.preventDefault();
    
    // Get final position
    const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
    
    // Find drop target at this position
    const elementBelow = document.elementFromPoint(clientX, clientY);
    const dropTarget = elementBelow?.closest('[data-drop-target]');
    
    const finalState = {
      ...dragStateRef.current,
      dropTarget,
      finalPosition: { x: clientX, y: clientY }
    };
    
    // Reset drag state
    const resetState = {
      isDragging: false,
      draggedItem: null,
      dragPosition: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      dropTarget: null,
      isValidDrop: false
    };
    
    setDragState(resetState);
    dragStateRef.current = resetState;
    
    return finalState;
  }, []);

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
      // Use passive event handling to avoid blocking other processes
      updateDrag(e);
    };

    const handleGlobalEnd = (e) => {
      // Prevent default but don't stop propagation to avoid interfering with other events
      e.preventDefault();
      endDrag(e);
    };

    // Add listeners with optimized options for better performance
    const options = { passive: false, capture: false }; // Changed capture to false for better performance
    document.addEventListener('mousemove', handleGlobalMove, options);
    document.addEventListener('touchmove', handleGlobalMove, options);
    document.addEventListener('mouseup', handleGlobalEnd, options);
    document.addEventListener('touchend', handleGlobalEnd, options);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove, options);
      document.removeEventListener('touchmove', handleGlobalMove, options);
      document.removeEventListener('mouseup', handleGlobalEnd, options);
      document.removeEventListener('touchend', handleGlobalEnd, options);
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
