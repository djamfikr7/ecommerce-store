'use client'

import { useCallback, useState } from 'react'
import { soundManager } from './sounds'

export function useSound() {
  const [enabled, setEnabled] = useState(true)

  const playMove = useCallback(() => {
    soundManager.playMove()
  }, [])

  const playCapture = useCallback(() => {
    soundManager.playCapture()
  }, [])

  const playCheck = useCallback(() => {
    soundManager.playCheck()
  }, [])

  const playGameOver = useCallback(() => {
    soundManager.playGameOver()
  }, [])

  const playClick = useCallback(() => {
    soundManager.playClick()
  }, [])

  const setEnabledState = useCallback((v: boolean) => {
    setEnabled(v)
    soundManager.setEnabled(v)
  }, [])

  return {
    enabled,
    setEnabled: setEnabledState,
    playMove,
    playCapture,
    playCheck,
    playGameOver,
    playClick,
  }
}
