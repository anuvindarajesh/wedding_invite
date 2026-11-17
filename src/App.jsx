import { useCallback, useEffect, useRef, useState } from 'react'

const EVENT = new Date('2027-02-07T16:00:00+05:30')
const ADDRESS = 'KG Convention Centre, Punalur, Kollam, Kerala'
const MAPS =
  'https://www.google.com/maps/search/?api=1&query=KG+Convention+Centre+Punalur+Kollam+Kerala'
const CAL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' +
  encodeURIComponent('Nidheesh & Lekshmi — Wedding Reception') +
  '&dates=20270207T103000Z/20270207T143000Z&location=' +
  encodeURIComponent(ADDRESS) +
  '&details=' +
  encodeURIComponent('With the blessings of our families.')

// Google Form / Google Sheets RSVP Configuration:
// Link your Google Form to a Google Sheet (in Form > Responses > "Link to Sheets")
// to have all RSVPs instantly stored in your Google Sheet in real time.
const RSVP_CONFIG = {
  // Replace with your Google Form URL ending in /formResponse:
  // e.g. 'https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse'
  formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdp9I2HNLzqWmIvx1yg272o7TZqbMdVPasl1q50x85h93PLDQ/formResponse',
  // Replace with the entry IDs of your Google Form questions:
  nameEntry: 'entry.2050193851',
  attendanceEntry: 'entry.2065188826',
  guestsEntry: 'entry.764510313',
}

// Scroll-reveal hook — fires once when the element enters the viewport
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}

// Wrapper that fades + rises into view on scroll
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`reveal${visible ? ' visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

function useCountdown() {
  const calc = () => Math.max(0, EVENT - new Date())
  const [ms, setMs] = useState(calc)

  useEffect(() => {
    const timer = setInterval(() => setMs(calc()), 1000)
    return () => clearInterval(timer)
  }, [])

  const seconds = Math.floor(ms / 1000)
  return {
    done: ms === 0,
    parts: [
      ['Days', Math.floor(seconds / 86400)],
      ['Hours', Math.floor(seconds / 3600) % 24],
      ['Minutes', Math.floor(seconds / 60) % 60],
      ['Seconds', seconds % 60],
    ],
  }
}

function Kolam({ active = true }) {
  const dots = [
    [-52, 0],
    [52, 0],
    [0, -52],
    [0, 52],
    [-37, -37],
    [37, -37],
    [-37, 37],
    [37, 37],
  ]

  return (
    <svg
      viewBox="-60 -60 120 120"
      className={`kolam ${active ? 'active' : ''} pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[135%] h-[135%] max-w-none opacity-60`}
      fill="none"
      stroke="#c5a66d"
      strokeWidth=".5"
      aria-hidden="true"
    >
      {[0, 45, 90, 135].map((rotation, index) => (
        <ellipse
          key={rotation}
          pathLength="1"
          rx="46"
          ry="17"
          transform={`rotate(${rotation})`}
          style={{ animationDelay: `${0.2 + index * 0.25}s` }}
        />
      ))}
      <circle
        className="l"
        pathLength="1"
        r="50"
        style={{ animationDelay: '1.2s' }}
      />
      {dots.map(([x, y], index) => (
        <circle
          key={`${x}-${y}`}
          className="d"
          cx={x}
          cy={y}
          r="1.2"
          fill="#c5a66d"
          stroke="none"
          style={{ animationDelay: `${1.3 + index * 0.08}s` }}
        />
      ))}
    </svg>
  )
}

function Snowfall({
  active = true,
  count = 350,
  minRadius = 1,
  maxRadius = 3,
  minSpeed = 0.4,
  maxSpeed = 1.4,
  wind = 0.3,
}) {
  const canvasRef = useRef(null)
  const snowflakesRef = useRef([])
  const animationFrameRef = useRef(0)
  const [started, setStarted] = useState(false)
  const isFalling = active && started

  // Start snowfall right when the kolam starts to draw (250ms after door opens)
  useEffect(() => {
    if (!active) return
    const timer = setTimeout(() => {
      setStarted(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [active])

  const naturalDistribution = useCallback(() => {
    const r = Math.random()
    if (r < 0.3) {
      return 0.1 + Math.random() * 0.3
    } else if (r < 0.9) {
      return 0.5 + Math.random() * 1.0
    } else {
      return 1.6 + Math.random() * 1.4
    }
  }, [])

  const initSnowflakes = useCallback(
    (width, height) => {
      const snowflakes = []
      const adjustedCount = Math.min(
        count,
        Math.max(12, Math.floor((width * height) / 25000)),
      )

      for (let i = 0; i < adjustedCount; i++) {
        snowflakes.push({
          x: Math.random() * width,
          // Start near and above the top so they begin cascading downwards as the kolam draws
          y: -Math.random() * (height * 0.5) - minRadius,
          radius: minRadius + Math.random() * (maxRadius - minRadius),
          speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
          opacity: 0.25 + Math.random() * 0.65,
          wind: (Math.random() - 0.5) * wind * 0.5,
          amplitude: naturalDistribution(),
          frequency: 0.001 + Math.random() * 0.008,
          angle: Math.random() * Math.PI * 2,
        })
      }
      snowflakesRef.current = snowflakes
    },
    [count, minRadius, maxRadius, minSpeed, maxSpeed, wind, naturalDistribution],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleResize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      initSnowflakes(width, height)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [initSnowflakes])

  useEffect(() => {
    if (!isFalling) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let isRunning = true

    const animate = () => {
      if (!isRunning) return
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      snowflakesRef.current.forEach((flake) => {
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
        // Light golden shimmer matching the wedding theme
        ctx.fillStyle = `rgba(238, 215, 162, ${flake.opacity})`
        ctx.fill()

        flake.y += flake.speed
        flake.angle += flake.frequency
        flake.x += flake.wind + Math.sin(flake.angle) * flake.amplitude

        if (flake.y > height) {
          flake.y = -flake.radius
          flake.x = Math.random() * width
          flake.amplitude = naturalDistribution()
          flake.frequency = 0.001 + Math.random() * 0.008
        }

        if (flake.x > width) {
          flake.x = 0
        } else if (flake.x < 0) {
          flake.x = width
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      isRunning = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isFalling, naturalDistribution])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-0 transition-opacity duration-1000 ${
        isFalling ? 'opacity-90' : 'opacity-0'
      }`}
    />
  )
}

function Hero({ active = true }) {
  const reveal = (delayClass) =>
    `transition-all duration-700 ease-out ${delayClass} ${
      active
        ? 'opacity-100 translate-y-0 filter-none'
        : 'opacity-0 translate-y-6 blur-[1px]'
    }`

  return (
    <header className="relative grid min-h-[100svh] place-items-center overflow-hidden px-6 py-14 text-center text-ivory bg-[#001e13]">
      <Snowfall active={active} />
      <div
        className={`pointer-events-none absolute inset-4 border border-gold/50 transition-opacity duration-700 delay-[100ms] ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="relative z-10 max-w-xl">
        <p className={`font-ml text-xl text-gold ${reveal('delay-[150ms]')}`}>
          Welcome
        </p>
        <div
          className={`relative mx-auto my-8 w-56 ${reveal('delay-[250ms]')}`}
        >
          <Kolam active={active} />
          <img
            src="/emblem.png"
            alt="Wedding emblem"
            className="relative block h-auto w-full"
          />
        </div>
        <h1
          className={`font-serif text-[clamp(44px,10vw,76px)] font-normal leading-[1.05] text-[#fff4df] ${reveal(
            'delay-[400ms]',
          )}`}
        >
          Nidheesh
          <span className="my-2 block text-[.42em] italic text-gold">and</span>
          Lekshmi
        </h1>
        <p
          className={`mx-auto mt-6 max-w-sm font-sans text-[15px] font-light leading-7 text-ivory/80 ${reveal(
            'delay-[550ms]',
          )}`}
        >
          With hearts full of joy and gratitude, we invite you to celebrate a
          beautiful new beginning.
        </p>
        <p
          className={`mt-6 font-serif text-xl italic text-gold ${reveal(
            'delay-[700ms]',
          )}`}
        >
          Sunday, 7 February 2027
        </p>
        <a
          href="#invitation"
          className={`mt-10 inline-block text-sm text-gold/90 hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${reveal(
            'delay-[850ms]',
          )}`}
        >
          Open invitation ↓
        </a>
      </div>
    </header>
  )
}

function Family() {
  const families = [
    {
      title: 'The groom’s family',
      lines: ['Satheesh Bhavan', 'Aickarakkonam, Kakkodu P.O.', 'Punalur, Kollam – 691331'],
    },
    {
      title: 'The bride’s family',
      lines: ['Divakara Mandiram', 'Perumpuzha P.O., Kollam'],
    },
  ]

  return (
    <section id="invitation" className="bg-ivory px-6 py-20 text-ink">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={100}>
          <h2 className="font-serif text-[clamp(30px,6vw,44px)] text-forest">
            With the blessings of our families
          </h2>
        </Reveal>
        <Reveal delay={250}>
          <p className="mt-8 font-serif text-lg leading-8 text-ink/80">
            Mrs. Bindu S &amp; Mr. Satheesababu M. S.
            <br />
            and
            <br />
            Mr. Biju D S &amp; Mrs. Deepthi D S
            <br />
            <br />
            cordially invite you and your family to the wedding reception of
          </p>
        </Reveal>
        <Reveal delay={400}>
          <p className="mt-8 font-serif text-[clamp(30px,6vw,44px)] italic text-forest">
            Nidheesh S <span className="text-lg not-italic text-brass">with</span>{' '}
            Lekshmi B
          </p>
        </Reveal>
        <div className="mt-12 grid gap-5 text-center sm:grid-cols-2">
          {families.map(({ title, lines }, idx) => (
            <Reveal key={title} delay={550 + idx * 150} className="h-full">
              <div className="border-y border-gold/60 py-5 h-full">
                <h3 className="font-serif text-xl text-forest">{title}</h3>
                <p className="mt-2 text-[14px] leading-7 text-ink/70">
                  {lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Details() {
  const { done, parts } = useCountdown()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy the address:', ADDRESS)
    }
  }

  return (
    <section id="details" className="bg-forest px-6 py-20 text-ivory">
      <div className="mx-auto max-w-2xl text-center">
        <Reveal delay={100}>
          <h2 className="font-serif text-[clamp(30px,6vw,44px)] text-[#f7edda]">
            Wedding reception
          </h2>
        </Reveal>
        <Reveal delay={250}>
          <div className="mx-auto mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="border border-gold/50 py-5">
              <div className="font-serif text-4xl">7 Feb</div>
              <div className="mt-1 text-[13px] text-gold">Sunday, 2027</div>
            </div>
            <div className="border border-gold/50 py-5">
              <div className="font-serif text-4xl">4:00 PM</div>
              <div className="mt-1 text-[13px] text-gold">until 8:00 PM</div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={400}>
          <p className="mt-8 font-serif text-2xl">KG Convention Centre</p>
          <p className="mt-1 text-[14px] text-ivory/70">Punalur, Kollam, Kerala</p>
        </Reveal>
        <Reveal delay={550}>
          <div className="mt-10" role="timer" aria-label="Time until the reception">
            {done ? (
              <p className="font-serif text-xl italic text-gold">
                Thank you for celebrating with us.
              </p>
            ) : (
              <>
                <div className="mx-auto grid max-w-sm grid-cols-4 divide-x divide-gold/30">
                  {parts.map(([label, value]) => (
                    <div key={label}>
                      <div className="font-serif text-3xl tabular-nums">
                        {String(value).padStart(2, '0')}
                      </div>
                      <div className="mt-1 text-[11px] text-gold">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[12px] text-ivory/60">until we gather</p>
              </>
            )}
          </div>
        </Reveal>
        <Reveal delay={700}>
          <div className="mt-10 flex flex-col justify-center gap-3 text-gold sm:flex-row">
            <a
              className="btn hover:bg-gold hover:text-forest"
              target="_blank"
              rel="noopener"
              href={MAPS}
            >
              Open in Google Maps
            </a>
            <a
              className="btn hover:bg-gold hover:text-forest"
              target="_blank"
              rel="noopener"
              href={CAL}
            >
              Add to calendar
            </a>
            <button
              className="btn hover:bg-gold hover:text-forest"
              onClick={copy}
            >
              {copied ? 'Address copied' : 'Copy address'}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Rsvp() {
  const [name, setName] = useState('')
  const [yes, setYes] = useState(true)
  const [guests, setGuests] = useState(2)
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'

  const submitRsvp = async (event) => {
    event?.preventDefault()
    if (!name.trim() || status === 'submitting') return

    setStatus('submitting')

    if (RSVP_CONFIG.formUrl) {
      try {
        const formData = new FormData()
        formData.append(RSVP_CONFIG.nameEntry, name.trim())
        formData.append(
          RSVP_CONFIG.attendanceEntry,
          yes ? 'Joyfully accept' : 'Regretfully decline',
        )
        if (yes) {
          formData.append(RSVP_CONFIG.guestsEntry, String(guests))
        }

        // POST to Google Forms with mode: 'no-cors' stores response directly in Google Forms/Sheets
        await fetch(RSVP_CONFIG.formUrl, {
          method: 'POST',
          mode: 'no-cors',
          body: formData,
        })
        setStatus('success')
      } catch (err) {
        console.error('RSVP submission error:', err)
        setStatus('error')
      }
    } else {
      // Demo / preview mode before formUrl is configured
      await new Promise((resolve) => setTimeout(resolve, 600))
      setStatus('success')
    }
  }

  const chip = (selected) =>
    `chip btn flex-1 font-medium transition-all ${
      selected
        ? '!border-forest !bg-forest !text-ivory shadow-sm'
        : '!border-forest/30 !bg-transparent !text-forest hover:!bg-forest/10'
    }`

  return (
    <section
      id="rsvp"
      className="border-t border-gold/40 bg-ivory px-6 py-20 text-ink"
    >
      <div className="mx-auto max-w-md text-center">
        <Reveal delay={100}>
          <h2 className="font-serif text-[clamp(30px,6vw,40px)] text-forest">
            Will you join us?
          </h2>
          <p className="mt-3 text-[14px] text-ink/70">
            Let the family know so we can welcome you well.
          </p>
        </Reveal>

        {status === 'success' ? (
          <Reveal delay={200}>
            <div className="mt-8 rounded-xl border border-gold/40 bg-white/70 p-7 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-forest text-gold text-xl font-serif">
                ✓
              </div>
              <h3 className="font-serif text-2xl text-forest">
                {yes ? 'We look forward to seeing you!' : 'Thank you for letting us know'}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink/75">
                {yes
                  ? `Thank you, ${name.trim()}! Your RSVP for ${guests} ${
                      guests === 1 ? 'guest' : 'guests'
                    } has been recorded in our guest list.`
                  : `Thank you, ${name.trim()}. Your response has been received. Even from afar, your blessings and warm wishes mean the world to Nidheesh & Lekshmi.`}
              </p>

              {yes ? (
                <>
                  <div className="mt-5 rounded-lg border border-gold/30 bg-ivory/60 p-3.5 text-xs text-forest">
                    <p className="font-medium tracking-wide">
                      Sunday, 7 February 2027 · 4:00 PM onwards
                    </p>
                    <p className="mt-0.5 text-ink/65">
                      KG Convention Centre, Punalur
                    </p>
                  </div>
                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
                    <a
                      href={CAL}
                      target="_blank"
                      rel="noopener"
                      className="btn !border-forest !bg-forest !text-ivory hover:!bg-leaf !text-xs !py-2.5"
                    >
                      Add to Google Calendar
                    </a>
                    <a
                      href={MAPS}
                      target="_blank"
                      rel="noopener"
                      className="btn !border-forest/40 !bg-transparent !text-forest hover:!bg-forest/10 !text-xs !py-2.5"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </>
              ) : (
                <div className="mt-5 pt-3 border-t border-gold/30">
                  <p className="font-serif text-base text-forest/80">
                    With Love, <strong className="font-bold text-forest">Nidheesh &amp; Lekshmi</strong>
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        ) : (
          <form onSubmit={submitRsvp}>
            <Reveal delay={250}>
              <label
                className="mt-8 block text-left text-[13px] text-ink/70"
                htmlFor="nm"
              >
                Your name
              </label>
              <input
                id="nm"
                value={name}
                onChange={(event) => {
                  setName(event.target.value)
                  if (status === 'error') setStatus('idle')
                }}
                placeholder="e.g. Anitha & family"
                className="mt-1 w-full border-b border-brass/60 bg-transparent py-2 font-serif text-xl text-forest outline-none placeholder:text-ink/30 focus:border-forest"
              />
            </Reveal>
            <Reveal delay={400}>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  className={chip(yes)}
                  aria-pressed={yes}
                  onClick={() => setYes(true)}
                >
                  Joyfully accept
                </button>
                <button
                  type="button"
                  className={chip(!yes)}
                  aria-pressed={!yes}
                  onClick={() => setYes(false)}
                >
                  Regretfully decline
                </button>
              </div>
            </Reveal>
            {yes && (
              <Reveal delay={500}>
                <div className="mt-6 flex items-center justify-center gap-5 text-forest">
                  <span className="text-[13px] text-ink/70">Guests</span>
                  <button
                    type="button"
                    className="chip btn !px-3 !py-1"
                    aria-label="Fewer guests"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                  >
                    −
                  </button>
                  <span className="w-6 font-serif text-3xl tabular-nums">
                    {guests}
                  </span>
                  <button
                    type="button"
                    className="chip btn !px-3 !py-1"
                    aria-label="More guests"
                    onClick={() => setGuests(Math.min(10, guests + 1))}
                  >
                    +
                  </button>
                </div>
              </Reveal>
            )}
            <Reveal delay={600}>
              <button
                type="submit"
                disabled={!name.trim() || status === 'submitting'}
                className="btn mt-8 w-full !border-forest !bg-forest !text-ivory disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:!bg-leaf"
              >
                {status === 'submitting' ? 'Recording RSVP...' : 'Send RSVP'}
              </button>
              {status === 'error' && (
                <p className="mt-2 text-xs text-red-600">
                  Could not record RSVP. You can also share directly on WhatsApp.
                </p>
              )}
              <p className="mt-3 text-[12px] text-ink/60">
                Saves your response directly to the guest list.
              </p>
            </Reveal>
          </form>
        )}
      </div>
    </section>
  )
}

function Closing() {
  const [message, setMessage] = useState('')

  const share = async () => {
    const data = {
      title: 'Nidheesh & Lekshmi — Wedding Reception',
      text: 'You are invited to the wedding reception on 7 February 2027, Punalur.',
      url: location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(data)
        return
      }
      await navigator.clipboard.writeText(location.href)
      setMessage('Link copied')
    } catch {
      setMessage('')
    }
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <footer className="bg-deep px-6 py-16 text-center text-ivory">
      <Reveal delay={100}>
        <h2 className="font-serif text-[clamp(26px,5vw,36px)] text-[#f2e8d4]">
          We look forward to celebrating with you
        </h2>
      </Reveal>
      <Reveal delay={250}>
        <p className="mt-5 font-serif text-lg text-ivory/80">
          With warm regards,
          <br />
          <span className="text-gold">Nidheesh &amp; Lekshmi</span>
        </p>
      </Reveal>
      <Reveal delay={400}>
        <button
          className="btn mt-8 text-gold hover:bg-gold hover:text-deep"
          onClick={share}
        >
          {message || 'Share this invitation'}
        </button>
      </Reveal>
      <Reveal delay={550}>
        <p className="mt-10 text-[12px] leading-6 text-ivory/60">
          With best compliments from
          <br />
          <span className="text-gold/90">Sudheesh, Neethu &amp; Parvathy</span>
        </p>
      </Reveal>
    </footer>
  )
}

function DoorLeaf({ side, isOpen }) {
  const isLeft = side === 'left'
  return (
    <div
      className={`${isLeft ? 'door-panel-left' : 'door-panel-right'} relative flex flex-col h-full overflow-hidden ${
        isOpen ? (isLeft ? 'door-open-left' : 'door-open-right') : ''
      }`}
      style={{ width: '50%' }}
    >
      {/* Clean deep forest base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002618] via-[#001e13] to-[#00120b]" />

      {/* Clean minimal gold perimeter border */}
      <div className="absolute inset-4 border border-gold/40 pointer-events-none" />
      <div className="absolute inset-5 border border-gold/15 pointer-events-none" />

      {/* Clean center seam gold strip */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gradient-to-r from-brass via-gold to-brass shadow-[0_0_8px_rgba(197,166,109,0.3)]"
        style={{ [isLeft ? 'right' : 'left']: 0 }}
      />

      {/* Depth shading on opening */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-[2800ms] ${
          isOpen
            ? isLeft
              ? 'opacity-40 bg-gradient-to-l from-black/60 to-transparent'
              : 'opacity-40 bg-gradient-to-r from-black/60 to-transparent'
            : 'opacity-0'
        }`}
      />
    </div>
  )
}

function DoorEntrance({ isOpen, onOpen, isDismissed }) {
  if (isDismissed) return null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Open wedding invitation"
      onClick={onOpen}
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-opacity duration-700 ${
        isOpen ? 'pointer-events-none opacity-0 delay-[2400ms]' : 'pointer-events-auto opacity-100'
      }`}
    >
      <div className="doors-perspective relative w-full h-full flex overflow-hidden">
        <DoorLeaf side="left" isOpen={isOpen} />
        <DoorLeaf side="right" isOpen={isOpen} />

        {/* Center Medallion */}
        <div
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-[700ms] ease-out flex flex-col items-center pointer-events-auto cursor-pointer ${
            isOpen ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Royal Seal */}
          <div className="door-seal-pulse rounded-full p-[6px] bg-gradient-to-br from-[#f0d080] via-[#ad8240] to-[#5a3a0e] shadow-[0_16px_48px_rgba(0,0,0,0.9),0_0_0_2px_rgba(197,166,109,0.3)]">
            <div className="rounded-full p-[6px] bg-gradient-to-br from-[#73511e] via-[#ad8240] to-[#73511e]">
              <div
                className="w-48 h-48 sm:w-60 sm:h-60 rounded-full flex flex-col items-center justify-center p-4 text-center relative"
                style={{
                  background: 'radial-gradient(ellipse at 40% 35%, #003622 0%, #002216 50%, #00140c 100%)',
                  boxShadow: 'inset 0 6px 24px rgba(0,0,0,0.9)',
                }}
              >
                {/* Inner ring */}
                <div className="absolute w-[calc(100%-20px)] h-[calc(100%-20px)] rounded-full border border-gold/30 pointer-events-none" />
                <span className="font-ml text-[11px] tracking-wider text-gold/70 mb-1">
                  സ്വാഗതം
                </span>
                <img
                  src="/emblem.png"
                  alt="Wedding Emblem"
                  className="w-14 h-14 sm:w-18 sm:h-18 object-contain"
                  style={{ filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.6))' }}
                />
                <p className="font-serif text-base sm:text-lg text-[#fff4df] font-normal leading-snug mt-1">
                  Nidheesh &amp; Lekshmi
                </p>
                <p className="font-sans text-[10px] uppercase tracking-widest text-gold/70 mt-0.5">
                  7 · Feb · 2027
                </p>
              </div>
            </div>
          </div>

          {/* Tap prompt */}
          <p className="mt-5 font-sans text-[11px] uppercase tracking-[0.2em] text-gold/60 animate-pulse">
            tap to open
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [doorsOpen, setDoorsOpen] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const openDoors = useCallback(() => {
    if (doorsOpen) return
    setDoorsOpen(true)
    setTimeout(() => {
      setIsDismissed(true)
    }, 3200)
  }, [doorsOpen])

  useEffect(() => {
    if (!doorsOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [doorsOpen])

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') && !doorsOpen) {
        e.preventDefault()
        openDoors()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [doorsOpen, openDoors])

  return (
    <main>
      <DoorEntrance
        isOpen={doorsOpen}
        onOpen={openDoors}
        isDismissed={isDismissed}
      />
      <Hero active={doorsOpen} />
      <div className="kasavu" />
      <Family />
      <div className="kasavu" />
      <Details />
      <Rsvp />
      <Closing />
    </main>
  )
}

export default App
