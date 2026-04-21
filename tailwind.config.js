/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,jsx,ts,tsx}', 'app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        gilroy: ['SVN-Gilroy', 'sans-serif']
      },
      colors: {
        'primary-blue-50': '#EEF3FB',
        'primary-blue-100': '#D6E1F4',
        'primary-blue-200': '#B6CAE9',
        'primary-blue-300': '#8FAEDA',
        'primary-blue-400': '#668FCA',
        'primary-blue-500': '#4F79BD',
        'primary-blue-600': '#3F69AE',
        'primary-blue-700': '#325495',
        'primary-blue-800': '#2B457A',
        'primary-blue-900': '#24355E',
        'primary-neutral-50': '#FFFFFF',
        'primary-neutral-100': '#F6F6F6',
        'primary-neutral-200': '#EAEAEA',
        'primary-neutral-300': '#BBBBBB',
        'primary-neutral-400': '#A4A4A4',
        'primary-neutral-500': '#72737D',
        'primary-neutral-600': '#777777',
        'primary-neutral-700': '#606060',
        'primary-neutral-800': '#4A4A4A',
        'primary-neutral-900': '#333333',
        'secondary-neutral-50': '#FDF4E2',
        'secondary-neutral-100': '#FBE8C2',
        'secondary-neutral-200': '#F7D28B',
        'secondary-neutral-300': '#F4C260',
        'secondary-neutral-400': '#F3B744',
        'secondary-neutral-500': '#F2B33A',
        'secondary-neutral-600': '#E99F2E',
        'secondary-neutral-700': '#A27011',
        'secondary-neutral-800': '#483105',
        'secondary-neutral-900': '#181101',
        'primary-error': '#F7493E',
        'primary-warning': '#FFC658',
        'primary-success': '#2AAD40',
        'primary-blue': '#3F69AE',
        'primary-answer-purple': '#A435CD',
        'primary-answer-pink': '#F9ACAC',
        'primary-answer-blue': '#8FCBFF',
        'primary-answer-yellow': '#FFC658',
        'primary-answer-green': '#2AAD40',
        'practice-score': 'var(--practice-score)',
        'practice-question': 'var(--practice-question)',
        'practice-question-count': 'var(--practice-question-count)',
        'practice-question-count-border': 'var(--practice-question-count-border)',
        'practice-question-description': 'var(--practice-question-description)',
        'practice-question-description-border': 'var(--practice-question-description-border)',
        'practice-question-text': 'var(--practice-question-text)',
        'practice-question-type': 'var(--practice-question-type)',

        'practice-answer-fill-blank-bg': 'var(--practice-answer-fill-blank-bg)',
        'practice-answer-fill-blank-text': 'var(--practice-answer-fill-blank-text)',
        'practice-answer-fill-blank': 'var(--practice-answer-fill-blank)',

        'practice-answer-matching-top': 'var(--practice-answer-matching-top)',
        'practice-answer-matching-bottom': 'var(--practice-answer-matching-bottom)',

        'practice-answer-sort-top': 'var(--practice-answer-sort-top)',
        'practice-answer-sort-bottom': 'var(--practice-answer-sort-bottom)',

        'practice-answer-reverse-word-bg': 'var(--practice-answer-reverse-word-bg)',

        'practice-correct-answer-text': 'var(--practice-correct-answer-text)',

        'practice-finish-bg': 'var(--practice-finish-bg)',
        'practice-finish-layer': 'var(--practice-finish-layer)',

        'practice-btn-check-answer': 'var(--practice-btn-check-answer)',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
        10: '10px',
        15: '15px',
        20: '20px'
      },
      fontSize: {
        11: '11px',
        13: '13px',
        15: '15px',
        17: '17px',
        19: '19px',
        21: '21px',
        23: '23px'
      },

      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' }
        }
      },
      animation: {
        'caret-blink': 'caret-blink 1.25s ease-out infinite'
      },
      screens: {
        xs: '470px',
        // Tablet (theo chuẩn là từ 640px đến 1023px)
        tablet: '768px', // iPad và tablet ngang
        'tablet-lg': '1024px', // tablet lớn (iPad Pro...)

        // MacBook 14.2" - từ 1512px trở lên
        mac14: '1512px'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
