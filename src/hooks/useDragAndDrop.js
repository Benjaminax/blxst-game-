import { useState, useCallback, useEffect, useRef } from 'react';

export function useDragAndDrop() {
  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    dragPosition: { x: 0, y: 0 },
    dragOffset: { x: 0, y: 0 },
    dropTarget: null,
    isValidDrop: false,
    updateScheduled: false
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
    
    // Enhanced offset calculations for both mobile and desktop
    const isMobile = event.touches !== undefined;
    const offsetY = isMobile ? 140 : 30; // Increased mobile offset, added PC offset
    const offsetX = isMobile ? 30 : 15; // Increased horizontal offset for both
    
    const newDragState = {
      isDragging: true,
      draggedItem: item,
      dragPosition: { x: centerX + offsetX, y: centerY - offsetY },
      dragOffset: { 
        x: clientX - centerX - offsetX, 
        y: clientY - centerY + offsetY 
      },
      dropTarget: null,
      isValidDrop: false,
      updateScheduled: false
    };
    
    setDragState(newDragState);
    dragStateRef.current = newDragState;
    
    // Add haptic feedback on mobile
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Prevent text selection during drag on PC
    if (!isMobile) {
      document.body.style.userSelect = 'none';
    }
  }, []);

  const updateDrag = useCallback((event) => {
    if (!dragStateRef.current.isDragging) return;
    
    event.preventDefault();
    
    // Get pointer position
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    
    // Use requestAnimationFrame for smooth animation with throttling
    if (!dragStateRef.current.updateScheduled) {
      dragStateRef.current.updateScheduled = true;
      requestAnimationFrame(() => {
        if (dragStateRef.current.isDragging) {
          updateDragPosition(clientX, clientY);
        }
        dragStateRef.current.updateScheduled = false;
      });
    }
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
      isValidDrop: false,
      updateScheduled: false
    };
    
    setDragState(resetState);
    dragStateRef.current = resetState;
    
    // Restore text selection on PC
    if (!event.changedTouches) {
      document.body.style.userSelect = '';
    }
    
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
      // Prevent scrolling and other default behaviors during drag
      e.preventDefault();
      e.stopPropagation();
      
      // Don't block music or other audio processes
      updateDrag(e);
    };

    const handleGlobalEnd = (e) => {
      // Prevent default but allow event to bubble for other handlers
      e.preventDefault();
      endDrag(e);
    };

    // Optimized event options for smooth performance
    const moveOptions = { passive: false, capture: true };
    const endOptions = { passive: false, capture: false };
    
    // Add listeners with different strategies for move vs end events
    document.addEventListener('mousemove', handleGlobalMove, moveOptions);
    document.addEventListener('touchmove', handleGlobalMove, moveOptions);
    document.addEventListener('mouseup', handleGlobalEnd, endOptions);
    document.addEventListener('touchend', handleGlobalEnd, endOptions);
    
    // Add additional PC-specific events for better drag experience
    document.addEventListener('mouseleave', handleGlobalEnd, endOptions);
    document.addEventListener('contextmenu', handleGlobalEnd, endOptions);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove, moveOptions);
      document.removeEventListener('touchmove', handleGlobalMove, moveOptions);
      document.removeEventListener('mouseup', handleGlobalEnd, endOptions);
      document.removeEventListener('touchend', handleGlobalEnd, endOptions);
      document.removeEventListener('mouseleave', handleGlobalEnd, endOptions);
      document.removeEventListener('contextmenu', handleGlobalEnd, endOptions);
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
