export interface LateralDrawerConfig {
  title: string;
  footer: LateralDrawerConfigFooter;
  size: 'small' | 'medium' | 'large';
}

export interface LateralDrawerConfigFooter {
  firstButton: LateralDrawerConfigButton;
  secondButton?: LateralDrawerConfigButton;
}

export interface LateralDrawerConfigButton {
  click: () => void;
  text: string;
  loading?: boolean;
  disabled?: boolean;
}
