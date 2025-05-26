import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';
import plugin from 'tailwindcss/plugin';

export default {
  darkMode: ['class'],
  content: ['./resource/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './pages/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        color: 'hsl(var(--color))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        background: {
          DEFAULT: 'hsl(var(--background))',
          theme: 'hsl(var(--background-theme))'
        },
        teal: {
          100: 'hsl(var(--teal-100))',
          600: 'hsl(var(--teal-600))',
          700: 'hsl(var(--teal-700))',
          900: 'hsl(var(--teal-900))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      backgroundImage: {
        'danger-area': 'repeating-linear-gradient(-45deg, transparent, transparent 20px, hsl(var(--background)/0.6) 20px, hsl(var(--background)/0.6) 40px)'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        system: ['var(--ff-system)'],
        'anek-telugu': ['var(--ff-anek-telugu)'],
        amiri: ['var(--ff-amiri)'],
        barlow: ['var(--ff-barlow)'],
        inter: ['var(--ff-inter)'],
        kanit: ['var(--ff-kanit)'],
        koulen: ['var(--ff-koulen)'],
        montserrat: ['var(--ff-montserrat)'],
        poppins: ['var(--ff-poppins)'],
        'roboto-mono': ['var(--ff-roboto-mono)'],
        'special-elit': ['var(--ff-special-elit)'],
        'geist-sans': ['var(--ff-geist-sans)'],
        'geist-mono': ['var(--ff-geist-mono)']
      },
      boxShadow: {
        card: 'var(--customShadows-card)'
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addBase, addUtilities }: PluginAPI) => {
      addBase({});
      addUtilities({
        '.scrollbar': {
          scrollbarColor: 'var(--scroll-color, #adb3bd) var(--scroll-bg, #0000)',
          scrollbarWidth: 'var(--scroll-w, thin)',
          scrollbarGutter: 'auto'
        },
        '.webkit-scrollbar': {
          '@supports (scrollbar-color: auto)': {
            '&::-webkit-scrollbar': {
              display: 'none',
              width: 'var(--scroll-sz, 0px)',
              height: 'var(--scroll-sz, 0px)',
              borderRadius: 'var(--scroll-rounded, 9999px)'
            },
            '&::-webkit-scrollbar-track': {
              background: 'var(--scroll-bg, #0000)'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--scroll-color, #0000)',
              borderRadius: 'var(--scroll-rounded, 9999px)'
            },
            '&:hover': {
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--scroll-color-hover, var(--scroll-color, #0000))'
              }
            }
          }
        },
        '.underline-hover': {
          position: 'relative',
          touchAction: 'manipulation',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 'var(--underline-offset, -0.5px)',
            backgroundColor: 'var(--underline-color, currentColor)',
            height: '1px'
          },
          '@media (hover: hover)': {
            '&::after': {
              left: '0',
              width: '100%',
              transform: 'scaleX(0)',
              transformOrigin: 'right center',
              transition: 'transform .45s cubic-bezier(0.86, 0, 0.07, 1)'
            },
            '&:hover': {
              '&::after': {
                transform: 'scaleX(1)',
                transformOrigin: 'left center',
                animation: 'none'
              }
            }
          },
          '@media not all and (hover: hover)': {
            '&::after': {
              width: '0'
            },
            '&:hover': {
              '&::after': {
                animation: 'underlinehover 0.75s cubic-bezier(0.86, 0, 0.07, 1)'
              }
            }
          }
        },
        '.timeline': {
          '--offset': 'calc(var(--tl-bullet-size) / 2 + var(--tl-line-width) / 2)',
          '&:where([data-align=left])': {
            // paddingInlineStart: "var(--pl ,var(--offset))",
            '& [data-tl=bullet]': {
              right: 'auto',
              left: 'calc((var(--tl-bullet-size) / 2 + var(--tl-line-width) / 2) * -1)'
            },
            '& [data-tl=body]': {
              paddingLeft: 'var(--offset)'
            },
            '& [data-tl=item]': {
              textAlign: 'var(--tli-text-align, left)',
              paddingLeft: 'var(--offset)',
              '&::before': {
                '--tli-line-right': 'auto',
                '--tli-line-left': 'calc(var(--tl-line-width) * -1)'
              }
            }
          },
          '&:where([data-align=right])': {
            // paddingInlineEnd: "var(--pr ,var(--offset))",
            '& [data-tl=bullet]': {
              left: 'auto',
              right: 'calc((var(--tl-bullet-size) / 2 + var(--tl-line-width) / 2) * -1)'
            },
            '& [data-tl=body]': {
              paddingRight: 'var(--offset)'
            },
            '& [data-tl=item]': {
              textAlign: 'var(--tli-text-align, right)',
              paddingRight: 'var(--offset)',
              '&::before': {
                '--tli-line-left': 'auto',
                '--tli-line-right': 'calc(var(--tl-line-width) * -1)'
              }
            }
          }
        },
        '.timeline-item': {
          '--tli-line': 'var(--tli-line-width, var(--tl-line-width)) var(--tli-has-line-active-style, var(--tl-line-style)) var(--tli-line-clr, var(--tl-line-clr))',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 'var(--tli-line-top, 0)',
            left: 'var(--tli-line-left, 0)',
            right: 'var(--tli-line-right, 0)',
            bottom: 'var(--tli-line-bottom, -2rem)',
            display: 'var(--tli-line-display, none)',
            borderInlineStart: 'var(--tli-line)',
            pointerEvents: 'none'
          },
          '&:where(:not(:first-of-type))': {
            marginTop: '2rem'
          },
          '&:where(:not(:last-of-type))': {
            '--tli-line-display': 'block'
          },
          '&:where([data-active]:has(+ [data-active]))': {
            '--tli-has-line-active-style': 'var(--tli-line-style)',
            '--tli-has-bullet-active-style': 'solid',
            '&::before': {
              borderColor: 'var(--active-line, var(--tli-active-line, var(--tl-line-clr)))'
            }
          }
        },
        '.timeline-item-bullet': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 'var(--tl-bullet-top, calc(var(--tl-bullet-size) * (-16.667 / 100)))',
          width: 'var(--tl-bullet-size)',
          height: 'var(--tl-bullet-size)',
          borderRadius: 'var(--tl-bullet-round)',
          outline:
            'var(--tli-line-width, var(--tl-line-width)) var(--tli-has-bullet-active-style, var(--tl-bullet-style)) var(--tli-line-clr, var(--tl-bullet-ring, var(--tl-line-clr)))',
          '&[data-active]': {
            outlineColor: 'var(--active-ring, var(--bullet-active-ring, var(--tl-line-clr)))'
          },
          '&[data-bullet]': {
            '&[data-active]': {
              backgroundColor: 'var(--active-bg, var(--tli-active-bg, var(--tl-line-clr)))',
              '& *': {
                color: 'var(--active-clr, var(--tli-active-clr))'
              }
            },
            '& svg': {
              flexShrink: '0',
              pointerEvents: 'none'
            }
          },
          '&[data-notice]': {
            '--inset-tr': 'calc(var(--tli-line-width, var(--tl-line-width)) * -0.75)',
            '&::after': {
              content: '""',
              zIndex: '0',
              position: 'absolute',
              width: '33.333333%',
              height: '33.333333%',
              top: 'var(--inset-tr)',
              right: 'var(--inset-tr)',
              borderRadius: 'inherit',
              backgroundColor: 'var(--notice-clr, var(--tli-notice-clr))',
              boxShadow:
                '0 0 0 calc(var(--tli-line-width, var(--tl-line-width)) / 2) var(--notice-clr, var(--tli-notice-clr)), 0 0 0 calc(var(--tli-line-width, var(--tl-line-width)) / 2 + 2px) var(--notice-ring, var(--tli-notice-ring))'
            }
          }
        },
        '.sizer': {
          width: 'var(--sz--w, var(--sz-w, var(--sz)))',
          minWidth: 'var(--sz-miw, var(--sz-min, var(--sz-w, var(--sz))))',
          maxWidth: 'var(--sz-maw, var(--sz-max, var(--sz-w, var(--sz))))',
          height: 'var(--sz--h, var(--sz-h, var(--sz)))',
          minHeight: 'var(--sz-mih, var(--sz-min, var(--sz-h, var(--sz))))',
          maxHeight: 'var(--sz-mah, var(--sz-max, var(--sz-h, var(--sz))))'
        },
        '.unmounted': {
          height: '0px',
          width: '0px',
          overflow: 'hidden',
          opacity: '0',
          scale: '0',
          display: 'none'
        },
        '.bg-clip-text': {
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        },
        '.centered, .center-left, .center-right': {
          display: 'flex',
          alignItems: 'center'
        },
        '.centered': {
          justifyContent: 'center'
        },
        '.center-left': {
          justifyContent: 'flex-start'
        },
        '.center-right': {
          justifyContent: 'flex-end'
        },
        '.center-top': {
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        },
        '.center-bottom': {
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        },
        '.text-h1': {
          fontSize: 'clamp(20px, 0.75rem + 4vw, 2.25rem)',
          lineHeight: '2.5rem'
        },
        '.text-h2': {
          fontSize: 'clamp(18px, 11px + 3.5vw, 1.875rem)',
          lineHeight: '2.25rem'
        },
        '.text-h3': {
          fontSize: 'clamp(17px, 14px + 3vw, 1.5rem)',
          lineHeight: '2rem'
        },
        '.text-h4': {
          fontSize: 'clamp(1rem, 0.75rem + 2vw, 1.35rem)',
          lineHeight: '1.75rem'
        },
        '.text-h5': {
          fontSize: 'clamp(1rem, 0.85rem + 2vw, 1.3rem)',
          lineHeight: '1.5'
        },
        '.text-h6': {
          fontSize: 'clamp(1rem, 0.75rem + 1vw, 1.25rem)',
          lineHeight: '1.5'
        },
        '.font-heading': {
          fontSize: 'clamp(2rem, 1rem + 3vw, 3.5rem)',
          letterSpacing: '-.01em',
          fontWeight: '800'
        },
        '.text-paragraph': {
          fontSize: 'clamp(0.925rem, 0.925rem + 1vw, 1rem)',
          lineHeight: '1.75rem'
        },
        '.text-span': {
          fontSize: 'clamp(0.75rem, 0.65rem + 0.65vw, 0.9rem)',
          lineHeight: '1.35'
        },
        '.h-inherit': {
          height: 'inherit'
        },
        '.w-inherit': {
          width: 'inherit'
        },
        '.size-inherit': { height: 'inherit', width: 'inherit' },
        '.inherit': {
          display: 'inherit'
        },
        '.position-inherit': {
          position: 'inherit'
        },
        '.grid-area-1': {
          gridArea: '1/1'
        },
        '.visibility-hidden': {
          visibility: 'hidden'
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden'
        },
        '.backface-visible': {
          backfaceVisibility: 'visible'
        },
        '.decoration-none': {
          textDecoration: 'none'
        },
        '.whitespace-pre-line': {
          whiteSpace: 'pre-line'
        },
        '.whitespace-pre-wrap': {
          whiteSpace: 'pre-wrap'
        },
        '.whitespace-break-spaces': {
          whiteSpace: 'break-spaces'
        },
        '.filter-icon': {
          filter: 'var(--filter-icon)'
        },
        '.filter-icon-foreground': {
          filter: 'var(--filter-icon-foreground)'
        },
        '.occure_load': {
          transformOrigin: 'center',
          animation: 'hop-arround 2s infinite'
        }
      });
    })
  ]
} satisfies Config;
