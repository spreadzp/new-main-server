
export class ArbitrageDto {
  readonly arbitrageId: string;
  readonly balanceVolume: number;
  readonly assetVolume: number;
  readonly asset: string;
  readonly closeSecondCickle: boolean;
}
