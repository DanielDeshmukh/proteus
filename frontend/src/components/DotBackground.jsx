import { useEffect, useRef } from "react"

const GOLD = [201, 169, 98]
const SILVER = [125, 138, 150]
const GAP = 18
const BASE_R = 1.3
const GLOW_RADIUS = 90
const GLOW_BOOST = 0.52

export function DotBackground() {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    dots: [],
    mouse: { x: -999, y: -999 },
    W: 0,
    H: 0,
    animId: null,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const state = stateRef.current

    function init() {
      const rect = canvas.getBoundingClientRect()
      state.W = canvas.width = rect.width
      state.H = canvas.height = rect.height
      const cols = Math.ceil(state.W / GAP) + 1
      const rows = Math.ceil(state.H / GAP) + 1
      state.dots = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jx = (Math.random() - 0.5) * 3.5
          const jy = (Math.random() - 0.5) * 3.5
          const useGold = Math.random() > 0.38
          const baseAlpha = useGold
            ? 0.10 + Math.random() * 0.10
            : 0.06 + Math.random() * 0.07
          state.dots.push({
            x: c * GAP + jx,
            y: r * GAP + jy,
            r: BASE_R * (0.7 + Math.random() * 0.6),
            color: useGold ? GOLD : SILVER,
            baseAlpha,
          })
        }
      }
    }

    function draw() {
      const { W, H, dots, mouse } = state
      ctx.clearRect(0, 0, W, H)

      ctx.fillStyle = "#111315"
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = "rgba(26,26,26,0.45)"
      ctx.fillRect(0, 0, W, H)

      for (const d of dots) {
        const dx = d.x - mouse.x
        const dy = d.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        let alpha = d.baseAlpha

        if (dist < GLOW_RADIUS) {
          const t = 1 - dist / GLOW_RADIUS
          const ease = t * t * (3 - 2 * t)
          alpha = Math.min(1, alpha + ease * GLOW_BOOST)
        }

        const [r, g, b] = d.color
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
        ctx.fill()
      }

      if (mouse.x > 0) {
        const grd = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, GLOW_RADIUS
        )
        grd.addColorStop(0, "rgba(201,169,98,0.055)")
        grd.addColorStop(0.4, "rgba(201,169,98,0.022)")
        grd.addColorStop(1, "rgba(201,169,98,0)")
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, GLOW_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
      }

      const topGrd = ctx.createLinearGradient(0, 0, 0, 64)
      topGrd.addColorStop(0, "rgba(17,19,21,0.4)")
      topGrd.addColorStop(1, "rgba(17,19,21,0)")
      ctx.fillStyle = topGrd
      ctx.fillRect(0, 0, W, 64)

      const botGrd = ctx.createLinearGradient(0, H - 64, 0, H)
      botGrd.addColorStop(0, "rgba(17,19,21,0)")
      botGrd.addColorStop(1, "rgba(17,19,21,0.4)")
      ctx.fillStyle = botGrd
      ctx.fillRect(0, H - 64, W, 64)
    }

    function loop() {
      draw()
      state.animId = requestAnimationFrame(loop)
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = state.W / rect.width
      const scaleY = state.H / rect.height
      state.mouse.x = (e.clientX - rect.left) * scaleX
      state.mouse.y = (e.clientY - rect.top) * scaleY
    }

    function onMouseLeave() {
      state.mouse.x = -999
      state.mouse.y = -999
    }

    init()
    loop()

    window.addEventListener("resize", init)
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseleave", onMouseLeave)

    return () => {
      cancelAnimationFrame(state.animId)
      window.removeEventListener("resize", init)
      canvas.removeEventListener("mousemove", onMouseMove)
      canvas.removeEventListener("mouseleave", onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        cursor: "crosshair",
        zIndex: 0,
        pointerEvents: "auto",
      }}
    />
  )
}
