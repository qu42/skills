import { useReducer } from 'react'
import styles from './Calculator.module.css'

const ACTIONS = {
  DIGIT: 'digit',
  OPERATOR: 'operator',
  EQUALS: 'equals',
  CLEAR: 'clear',
  TOGGLE_SIGN: 'toggle_sign',
  PERCENT: 'percent',
  SQRT: 'sqrt',
  DECIMAL: 'decimal',
}

function evaluate(a, b, op) {
  const x = parseFloat(a)
  const y = parseFloat(b)
  if (op === '+') return x + y
  if (op === '-') return x - y
  if (op === '*') return x * y
  if (op === '/') return y === 0 ? 'Error' : x / y
  return b
}

function format(value) {
  if (value === 'Error') return 'Error'
  const num = parseFloat(value)
  if (isNaN(num)) return '0'
  // Limit display to avoid overflow
  const str = num.toPrecision(10).replace(/\.?0+$/, '')
  return parseFloat(str).toLocaleString('en-US', { maximumFractionDigits: 10 })
}

const initialState = {
  current: '0',   // value being entered
  previous: null, // previous operand
  operator: null, // pending operator
  waitingForOperand: false,
}

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.DIGIT: {
      if (state.waitingForOperand) {
        return { ...state, current: action.digit, waitingForOperand: false }
      }
      if (state.current === '0' && action.digit !== '.') {
        return { ...state, current: action.digit }
      }
      if (state.current.length >= 12) return state
      return { ...state, current: state.current + action.digit }
    }

    case ACTIONS.DECIMAL: {
      if (state.waitingForOperand) {
        return { ...state, current: '0.', waitingForOperand: false }
      }
      if (state.current.includes('.')) return state
      return { ...state, current: state.current + '.' }
    }

    case ACTIONS.OPERATOR: {
      const next = state.operator && !state.waitingForOperand
        ? String(evaluate(state.previous, state.current, state.operator))
        : state.current
      return {
        current: next,
        previous: next,
        operator: action.operator,
        waitingForOperand: true,
      }
    }

    case ACTIONS.EQUALS: {
      if (!state.operator || state.waitingForOperand) return state
      const result = String(evaluate(state.previous, state.current, state.operator))
      return { current: result, previous: null, operator: null, waitingForOperand: true }
    }

    case ACTIONS.TOGGLE_SIGN: {
      if (state.current === '0') return state
      const toggled = state.current.startsWith('-')
        ? state.current.slice(1)
        : '-' + state.current
      return { ...state, current: toggled }
    }

    case ACTIONS.PERCENT: {
      const pct = String(parseFloat(state.current) / 100)
      return { ...state, current: pct }
    }

    case ACTIONS.SQRT: {
      const n = parseFloat(state.current)
      const result = n < 0 ? 'Error' : String(Math.sqrt(n))
      return { ...state, current: result, waitingForOperand: true }
    }

    case ACTIONS.CLEAR:
      return initialState

    default:
      return state
  }
}

const BUTTONS = [
  { label: 'AC', action: { type: ACTIONS.CLEAR },        variant: 'function' },
  { label: '√',   action: { type: ACTIONS.SQRT },        variant: 'function' },
  { label: '%',  action: { type: ACTIONS.PERCENT },      variant: 'function' },
  { label: '/',  action: { type: ACTIONS.OPERATOR, operator: '/' }, variant: 'operator' },

  { label: '7', action: { type: ACTIONS.DIGIT, digit: '7' } },
  { label: '8', action: { type: ACTIONS.DIGIT, digit: '8' } },
  { label: '9', action: { type: ACTIONS.DIGIT, digit: '9' } },
  { label: '*', action: { type: ACTIONS.OPERATOR, operator: '*' }, variant: 'operator' },

  { label: '4', action: { type: ACTIONS.DIGIT, digit: '4' } },
  { label: '5', action: { type: ACTIONS.DIGIT, digit: '5' } },
  { label: '6', action: { type: ACTIONS.DIGIT, digit: '6' } },
  { label: '-', action: { type: ACTIONS.OPERATOR, operator: '-' }, variant: 'operator' },

  { label: '1', action: { type: ACTIONS.DIGIT, digit: '1' } },
  { label: '2', action: { type: ACTIONS.DIGIT, digit: '2' } },
  { label: '3', action: { type: ACTIONS.DIGIT, digit: '3' } },
  { label: '+', action: { type: ACTIONS.OPERATOR, operator: '+' }, variant: 'operator' },

  { label: '0', action: { type: ACTIONS.DIGIT, digit: '0' }, wide: true },
  { label: '.', action: { type: ACTIONS.DECIMAL } },
  { label: '=', action: { type: ACTIONS.EQUALS }, variant: 'operator' },
]

export default function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const isOperatorActive = (op) => state.operator === op && state.waitingForOperand

  return (
    <div className={styles.calculator}>
      <div className={styles.display}>
        <span className={styles.expression}>
          {state.previous != null ? `${state.previous} ${state.operator ?? ''}` : ''}
        </span>
        <span className={styles.current}>{format(state.current)}</span>
      </div>

      <div className={styles.grid}>
        {BUTTONS.map(({ label, action, variant, wide }) => (
          <button
            key={label}
            className={[
              styles.btn,
              variant === 'function' ? styles.btnFunction : '',
              variant === 'operator' ? styles.btnOperator : '',
              wide ? styles.btnWide : '',
              isOperatorActive(action.operator) ? styles.btnActive : '',
            ].join(' ')}
            onClick={() => dispatch(action)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
