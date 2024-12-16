export const basicSymbols = [
    {
      symbol: '\\frac{a}{b}',
      display: '\\frac{a}{b}',
      wrapper: true
    },
    {
      symbol: '\\sqrt{x}',
      display: '\\sqrt{x}',
      wrapper: true
    },
    {
      symbol: '^2',
      display: 'x^2',
      wrapper: false
    },
    {
      symbol: '_n',
      display: 'x_n',
      wrapper: false
    },
    {
      symbol: '\\pi',
      display: '\\pi',
      wrapper: false
    },
    {
      symbol: '\\theta',
      display: '\\theta',
      wrapper: false
    },
    {
      symbol: '\\infty',
      display: '\\infty',
      wrapper: false
    },
    {
      symbol: '\\int',
      display: '\\int',
      wrapper: false
    },
  ];
  
  export const trigSymbols = [
    {
      symbol: '\\sin',
      display: '\\sin(x)',
      wrapper: false
    },
    {
      symbol: '\\cos',
      display: '\\cos(x)',
      wrapper: false
    },
    {
      symbol: '\\tan',
      display: '\\tan(x)',
      wrapper: false
    },
    {
      symbol: '\\cot',
      display: '\\cot(x)',
      wrapper: false
    },
    {
      symbol: '\\sec',
      display: '\\sec(x)',
      wrapper: false
    },
    {
      symbol: '\\csc',
      display: '\\csc(x)',
      wrapper: false
    },
  ];
  
  export const chemSymbols = [
    {
      symbol: 'H_2O',
      display: 'H_2O',
      wrapper: true
    },
    {
      symbol: 'CO_2',
      display: 'CO_2',
      wrapper: true
    },
    {
      symbol: '\\rightarrow',
      display: '\\rightarrow',
      wrapper: false
    },
    {
      symbol: '\\leftrightarrow',
      display: '\\leftrightarrow',
      wrapper: false
    },
    {
      symbol: '\\Delta',
      display: '\\Delta',
      wrapper: false
    },
  ];
  
  export const templates = [
    {
      name: 'Quadratic Formula',
      symbol: 'x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
      wrapper: true
    },
    {
      name: 'Integration Limits',
      symbol: '\\int_{a}^{b} f(x) dx',
      wrapper: true
    },
    {
      name: 'Sum Notation',
      symbol: '\\sum_{i=1}^{n} x_i',
      wrapper: true
    },
    {
      name: 'Chemical Equation',
      symbol: 'CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O',
      wrapper: true
    },
  ];