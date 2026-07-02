/**
 * Sky Supply Side Revenues — dataset.
 *
 * Generated from the Soter monthly settlement reports
 * (github.com/soterlabs/settlement-reports, reports/<partner>/<month>/).
 * Headline/venue/refcode/excluded rows come from summary.md; rateBuild,
 * skyDirect and debtDaily come from the .xlsx sheets (Sky Revenue / Sky
 * Direct / Debt). Values are USD unless noted; rate fields are annual
 * fractions. Skybase is intentionally excluded. Generated — do not edit.
 */
import type { SsrReport } from "./ssr-types";

export const SSR_MONTHS = ["2026-01","2026-02","2026-03","2026-04","2026-05"] as const;

export const SSR_MONTH_LABELS: Record<string, string> = {
  "2026-01": "Jan",
  "2026-02": "Feb",
  "2026-03": "Mar",
  "2026-04": "Apr",
  "2026-05": "May",
};

export const ssrReports: SsrReport[] = [
  {
    "partner": "grove",
    "month": "2026-01",
    "periodDays": 31,
    "headline": {
      "agentRate": 6275.53,
      "distributionRewards": 0,
      "primeAgentNetRevenue": -985990.35,
      "primeSideSkyDirectExposure": 933299.18,
      "primeAgentProfit": -46415.64,
      "primeCostOfFunds": 3322924.21,
      "skySideSkyDirectExposure": 2954411.88,
      "skyRevenue": 6277336.09
    },
    "venues": [
      {
        "id": "E1",
        "label": "Aave Horizon RWA RLUSD (aToken)",
        "valueSom": 50248550.46,
        "valueEom": 101329036.6,
        "periodInflow": 50974766.27,
        "actualRev": 105719.87,
        "revenue": 105719.87,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E2",
        "label": "Aave Horizon RWA USDC (aToken)",
        "valueSom": 10056422.2,
        "valueEom": 11600502.75,
        "periodInflow": 1500068.08,
        "actualRev": 44012.47,
        "revenue": 44012.47,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E3",
        "label": "Aave Ethereum RLUSD (aToken)",
        "valueSom": 241966197.04,
        "valueEom": 252762587.5,
        "periodInflow": 10561390.89,
        "actualRev": 234999.57,
        "revenue": 234999.57,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E4",
        "label": "Grove x Steakhouse USDC (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E5",
        "label": "Grove x Steakhouse USDC High Yield (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 1009793.26,
        "periodInflow": 999752.64,
        "actualRev": 10040.62,
        "revenue": 10040.62,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E6",
        "label": "Grove x Steakhouse AUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E7",
        "label": "Securitize Tokenized AAA CLO Fund (STAC)",
        "valueSom": 100000000,
        "valueEom": 100616387.9,
        "periodInflow": 0,
        "actualRev": 616387.9,
        "revenue": 616387.9,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E8",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA)",
        "valueSom": 751935537.9,
        "valueEom": 454188405.33,
        "periodInflow": -300110301.94,
        "actualRev": 2363169.37,
        "revenue": 933299.18,
        "sdRevenue": 1429870.18,
        "sdShare": 0.6051,
        "spreadReimb": 0
      },
      {
        "id": "E9",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 258849970.75,
        "valueEom": 559853396.47,
        "periodInflow": 300000000,
        "actualRev": 1003425.72,
        "revenue": 0,
        "sdRevenue": 1003425.72,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E10",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 178974854.01,
        "valueEom": 179495969.98,
        "periodInflow": 0,
        "actualRev": 521115.97,
        "revenue": 0,
        "sdRevenue": 521115.97,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E11",
        "label": "Curve AUSD/USDC stableswap LP",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E12",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E13",
        "label": "RLUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E15",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E16",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E17",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E18",
        "label": "sUSDS raw / POL (ALM idle — Cat B 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E19",
        "label": "Grove x Steakhouse USDC High Yield (Base, Morpho 4626)",
        "valueSom": 0,
        "valueEom": 1001359.02,
        "periodInflow": 1000018.22,
        "actualRev": 1340.8,
        "revenue": 1340.8,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E20",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA-avalanche)",
        "valueSom": 255065350.29,
        "valueEom": 256109946.4,
        "periodInflow": 0,
        "actualRev": 1044596.11,
        "revenue": 1044596.11,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E21",
        "label": "Galaxy Arch CLO Token (GACLO-1)",
        "valueSom": 49900000,
        "valueEom": 49900000,
        "periodInflow": 0,
        "actualRev": 209136.25,
        "revenue": 209136.25,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E22",
        "label": "Anemoy Tokenized Apollo Diversified Credit Fund (ACRDX)",
        "valueSom": 50952997.02,
        "valueEom": 51022216.71,
        "periodInflow": 0,
        "actualRev": 69219.69,
        "revenue": 69219.69,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E23",
        "label": "Steakhouse Prime Instant (Base, Morpho V2)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E24",
        "label": "Steakhouse High Yield PYUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E26",
        "label": "PYUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E27",
        "label": "USDC raw on Base (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E30",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions — alt holder)",
        "valueSom": 24998427.31,
        "valueEom": 25003445.42,
        "periodInflow": 3630.94,
        "actualRev": 1387.18,
        "revenue": 1387.18,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E31",
        "label": "AUSD raw (alt holder idle)",
        "valueSom": 0.08,
        "valueEom": 3688.95,
        "periodInflow": 0,
        "actualRev": 3688.87,
        "revenue": 3688.87,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E32",
        "label": "USDC raw (alt holder idle)",
        "valueSom": 5849.73,
        "valueEom": 2254.27,
        "periodInflow": 0,
        "actualRev": -3595.46,
        "revenue": -3595.46,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E37",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E38",
        "label": "Agora AUSD incentives (cash distribution to Grove Eth ALM)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2000",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2001",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2002",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2003",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2005",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2008",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2222",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 1071984731.030483,
      "baseRate": 0.04312000189646037,
      "referenceRate": 0.0367,
      "referenceRateKind": "tbill_3m",
      "subsidisedRate": 0.0367,
      "effectiveRate": 0.03717115181169214,
      "diffVsBaseBps": -59.48850084768234,
      "subsidyBenefit": 520885.9412035887,
      "cofAtFullBase": 3843810.152904379,
      "cofOnUtilized": 3322924.21170079,
      "skyDirectComponent": 2954411.877337005,
      "skyRevenueMax": 6577707.820120571,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "E10",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "BUIDL on Eth",
        "actualRevenue": 521115.97,
        "sdRevenue": 521115.97
      },
      {
        "id": "E9",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "JTRSY on Eth",
        "actualRevenue": 1003425.723947301,
        "sdRevenue": 1003425.723947301
      },
      {
        "id": "E8",
        "kind": "capped",
        "cap": 325000000,
        "start": "2025-10-23",
        "end": "2026-03-12",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3.0.6.1 — Historical SDE",
        "label": "JAAA on Eth (≤ $325M)",
        "actualRevenue": 2363169.367297311,
        "sdRevenue": 1429870.183389704
      }
    ],
    "debtDaily": [
      {
        "date": "2026-01-01",
        "cumDebt": 1984828055,
        "utilized": 1222003230,
        "dailySkyCharge": 124430.28
      },
      {
        "date": "2026-01-02",
        "cumDebt": 1985828055,
        "utilized": 1222967317,
        "dailySkyCharge": 124541.79
      },
      {
        "date": "2026-01-03",
        "cumDebt": 1985828055,
        "utilized": 1222967317,
        "dailySkyCharge": 124541.79
      },
      {
        "date": "2026-01-04",
        "cumDebt": 1985828055,
        "utilized": 1222927951,
        "dailySkyCharge": 124537.24
      },
      {
        "date": "2026-01-05",
        "cumDebt": 1995828055,
        "utilized": 1232805367,
        "dailySkyCharge": 125679.73
      },
      {
        "date": "2026-01-06",
        "cumDebt": 2012328055,
        "utilized": 1249265009,
        "dailySkyCharge": 127583.58
      },
      {
        "date": "2026-01-07",
        "cumDebt": 2006577041,
        "utilized": 1203471935,
        "dailySkyCharge": 122286.81
      },
      {
        "date": "2026-01-08",
        "cumDebt": 2026577041,
        "utilized": 1223433063,
        "dailySkyCharge": 124595.66
      },
      {
        "date": "2026-01-09",
        "cumDebt": 1926524961,
        "utilized": 1103339226,
        "dailySkyCharge": 110704.7
      },
      {
        "date": "2026-01-10",
        "cumDebt": 1926524961,
        "utilized": 1103339226,
        "dailySkyCharge": 110704.7
      },
      {
        "date": "2026-01-11",
        "cumDebt": 1926524961,
        "utilized": 1103339226,
        "dailySkyCharge": 110704.7
      },
      {
        "date": "2026-01-12",
        "cumDebt": 1956524961,
        "utilized": 1113207323,
        "dailySkyCharge": 111846.12
      },
      {
        "date": "2026-01-13",
        "cumDebt": 1946290696,
        "utilized": 1042931975,
        "dailySkyCharge": 103717.54
      },
      {
        "date": "2026-01-14",
        "cumDebt": 1971790696,
        "utilized": 1068391579,
        "dailySkyCharge": 106662.39
      },
      {
        "date": "2026-01-15",
        "cumDebt": 1961776234,
        "utilized": 1018329389,
        "dailySkyCharge": 100871.82
      },
      {
        "date": "2026-01-16",
        "cumDebt": 1961776234,
        "utilized": 1018275744,
        "dailySkyCharge": 100865.61
      },
      {
        "date": "2026-01-17",
        "cumDebt": 1961776234,
        "utilized": 1018275744,
        "dailySkyCharge": 100865.61
      },
      {
        "date": "2026-01-18",
        "cumDebt": 1961776234,
        "utilized": 1018275744,
        "dailySkyCharge": 100865.61
      },
      {
        "date": "2026-01-19",
        "cumDebt": 1962777234,
        "utilized": 1019276744,
        "dailySkyCharge": 100981.4
      },
      {
        "date": "2026-01-20",
        "cumDebt": 1933909643,
        "utilized": 970172372,
        "dailySkyCharge": 95806.17
      },
      {
        "date": "2026-01-21",
        "cumDebt": 1934309643,
        "utilized": 950517206,
        "dailySkyCharge": 93865.19
      },
      {
        "date": "2026-01-22",
        "cumDebt": 1972909643,
        "utilized": 989061022,
        "dailySkyCharge": 97671.46
      },
      {
        "date": "2026-01-23",
        "cumDebt": 1972909643,
        "utilized": 989001947,
        "dailySkyCharge": 97665.62
      },
      {
        "date": "2026-01-24",
        "cumDebt": 1974009643,
        "utilized": 970100208,
        "dailySkyCharge": 95799.05
      },
      {
        "date": "2026-01-25",
        "cumDebt": 1974009643,
        "utilized": 970100208,
        "dailySkyCharge": 95799.05
      },
      {
        "date": "2026-01-26",
        "cumDebt": 2007509643,
        "utilized": 1003411510,
        "dailySkyCharge": 99146.3
      },
      {
        "date": "2026-01-27",
        "cumDebt": 2007509643,
        "utilized": 983350181,
        "dailySkyCharge": 97107.5
      },
      {
        "date": "2026-01-28",
        "cumDebt": 2027509643,
        "utilized": 1003284553,
        "dailySkyCharge": 99131.62
      },
      {
        "date": "2026-01-29",
        "cumDebt": 2049561643,
        "utilized": 1005279794,
        "dailySkyCharge": 99362.4
      },
      {
        "date": "2026-01-30",
        "cumDebt": 2049561643,
        "utilized": 985212276,
        "dailySkyCharge": 97291.39
      },
      {
        "date": "2026-01-31",
        "cumDebt": 2049561643,
        "utilized": 985212276,
        "dailySkyCharge": 97291.39
      }
    ],
    "excludedVenues": [
      {
        "id": "E14",
        "label": "AUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E25",
        "label": "Grove x Steakhouse High Yield AUSD (Monad, Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E33",
        "label": "Uniswap V3 AUSD/USDC pool (Monad, NFT positions)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E34",
        "label": "AUSD raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E35",
        "label": "USDC raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E36",
        "label": "OOB principal via 0xd94f (relay to Monad ALM EOA → AUSD acquisition)",
        "valueSom": 0,
        "valueEom": 0
      }
    ]
  },
  {
    "partner": "grove",
    "month": "2026-02",
    "periodDays": 28,
    "headline": {
      "agentRate": 5809.87,
      "distributionRewards": 0,
      "primeAgentNetRevenue": 2486873.36,
      "primeSideSkyDirectExposure": 396689.67,
      "primeAgentProfit": 2889372.9,
      "primeCostOfFunds": 2998286.45,
      "skySideSkyDirectExposure": 3138915.45,
      "skyRevenue": 6137201.9
    },
    "venues": [
      {
        "id": "E1",
        "label": "Aave Horizon RWA RLUSD (aToken)",
        "valueSom": 101329036.6,
        "valueEom": 140173858.07,
        "periodInflow": 38754503.92,
        "actualRev": 90317.55,
        "revenue": 911623.58,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E2",
        "label": "Aave Horizon RWA USDC (aToken)",
        "valueSom": 11600502.75,
        "valueEom": 0,
        "periodInflow": -11619098.35,
        "actualRev": 18595.61,
        "revenue": 18595.61,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E3",
        "label": "Aave Ethereum RLUSD (aToken)",
        "valueSom": 252762587.5,
        "valueEom": 263125087.29,
        "periodInflow": 10173263.67,
        "actualRev": 189236.11,
        "revenue": 3152797.75,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E4",
        "label": "Grove x Steakhouse USDC (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 1002368.85,
        "periodInflow": 1000032.96,
        "actualRev": 2335.9,
        "revenue": 2335.9,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E5",
        "label": "Grove x Steakhouse USDC High Yield (Morpho 4626)",
        "valueSom": 1009793.26,
        "valueEom": 1012325.68,
        "periodInflow": 0,
        "actualRev": 2532.42,
        "revenue": 2532.42,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E6",
        "label": "Grove x Steakhouse AUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 15806005.1,
        "periodInflow": 15800308.84,
        "actualRev": 5696.25,
        "revenue": 5696.25,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E7",
        "label": "Securitize Tokenized AAA CLO Fund (STAC)",
        "valueSom": 100616387.9,
        "valueEom": 100804666.1,
        "periodInflow": 0,
        "actualRev": 188278.2,
        "revenue": 188278.2,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E8",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA)",
        "valueSom": 454188405.33,
        "valueEom": 455576922.49,
        "periodInflow": 0,
        "actualRev": 1388517.16,
        "revenue": 396689.67,
        "sdRevenue": 991827.49,
        "sdShare": 0.7143,
        "spreadReimb": 0
      },
      {
        "id": "E9",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 559853396.47,
        "valueEom": 561291355.38,
        "periodInflow": 0,
        "actualRev": 1437958.91,
        "revenue": 0,
        "sdRevenue": 1437958.91,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E10",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 179495969.98,
        "valueEom": 430205099.03,
        "periodInflow": 249925000,
        "actualRev": 709129.05,
        "revenue": 0,
        "sdRevenue": 709129.05,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E11",
        "label": "Curve AUSD/USDC stableswap LP",
        "valueSom": 0,
        "valueEom": 25000444.78,
        "periodInflow": 25000444.78,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E12",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions)",
        "valueSom": 0,
        "valueEom": 25008038.97,
        "periodInflow": 25000000,
        "actualRev": 8038.97,
        "revenue": 8038.97,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E13",
        "label": "RLUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E15",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E16",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E17",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E18",
        "label": "sUSDS raw / POL (ALM idle — Cat B 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E19",
        "label": "Grove x Steakhouse USDC High Yield (Base, Morpho 4626)",
        "valueSom": 1001359.02,
        "valueEom": 1004254.24,
        "periodInflow": 0,
        "actualRev": 2895.22,
        "revenue": 2895.22,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E20",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA-avalanche)",
        "valueSom": 256109946.4,
        "valueEom": 256892910.15,
        "periodInflow": 0,
        "actualRev": 782963.75,
        "revenue": 782963.75,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E21",
        "label": "Galaxy Arch CLO Token (GACLO-1)",
        "valueSom": 49900000,
        "valueEom": 49900000,
        "periodInflow": 0,
        "actualRev": 402939.81,
        "revenue": 402939.81,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E22",
        "label": "Anemoy Tokenized Apollo Diversified Credit Fund (ACRDX)",
        "valueSom": 51022216.71,
        "valueEom": 51026217.85,
        "periodInflow": 0,
        "actualRev": 4001.14,
        "revenue": 4001.14,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E23",
        "label": "Steakhouse Prime Instant (Base, Morpho V2)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E24",
        "label": "Steakhouse High Yield PYUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E26",
        "label": "PYUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E27",
        "label": "USDC raw on Base (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E30",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions — alt holder)",
        "valueSom": 25003445.42,
        "valueEom": 0,
        "periodInflow": -25001755.88,
        "actualRev": -1689.54,
        "revenue": -1689.54,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E31",
        "label": "AUSD raw (alt holder idle)",
        "valueSom": 3688.95,
        "valueEom": 10068.98,
        "periodInflow": 0,
        "actualRev": 6380.03,
        "revenue": 6380.03,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E32",
        "label": "USDC raw (alt holder idle)",
        "valueSom": 2254.27,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": -2254.27,
        "revenue": -2254.27,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E37",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E38",
        "label": "Agora AUSD incentives (cash distribution to Grove Eth ALM)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 25,
        "revenue": 25,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2000",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2001",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2002",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2003",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2005",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2008",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2222",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 1062479073.381894,
      "baseRate": 0.04312000189646037,
      "referenceRate": 0.03685357142857143,
      "referenceRateKind": "tbill_3m",
      "subsidisedRate": 0.0371146726980668,
      "effectiveRate": 0.03747046067346277,
      "diffVsBaseBps": -56.495412229976,
      "subsidyBenefit": 442756.1742453264,
      "cofAtFullBase": 3441042.626468746,
      "cofOnUtilized": 2998286.45222342,
      "skyDirectComponent": 3138915.4480151,
      "skyRevenueMax": 6865095.469987601,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "E10",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "BUIDL on Eth",
        "actualRevenue": 709129.05,
        "sdRevenue": 709129.05
      },
      {
        "id": "E9",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "JTRSY on Eth",
        "actualRevenue": 1437958.912749179,
        "sdRevenue": 1437958.912749179
      },
      {
        "id": "E8",
        "kind": "capped",
        "cap": 325000000,
        "start": "2025-10-23",
        "end": "2026-03-12",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3.0.6.1 — Historical SDE",
        "label": "JAAA on Eth (≤ $325M)",
        "actualRevenue": 1388517.160018169,
        "sdRevenue": 991827.4852659209
      }
    ],
    "debtDaily": [
      {
        "date": "2026-02-01",
        "cumDebt": 2051561643,
        "utilized": 987212276,
        "dailySkyCharge": 98186.76
      },
      {
        "date": "2026-02-02",
        "cumDebt": 2082334465,
        "utilized": 1017932562,
        "dailySkyCharge": 102039.23
      },
      {
        "date": "2026-02-03",
        "cumDebt": 2084036165,
        "utilized": 1019616751,
        "dailySkyCharge": 102234.03
      },
      {
        "date": "2026-02-04",
        "cumDebt": 2123736165,
        "utilized": 1059048092,
        "dailySkyCharge": 106794.96
      },
      {
        "date": "2026-02-05",
        "cumDebt": 2182040052,
        "utilized": 1067302078,
        "dailySkyCharge": 107243.28
      },
      {
        "date": "2026-02-06",
        "cumDebt": 2240040052,
        "utilized": 1075234884,
        "dailySkyCharge": 108414.06
      },
      {
        "date": "2026-02-07",
        "cumDebt": 2240040052,
        "utilized": 1075234884,
        "dailySkyCharge": 108414.06
      },
      {
        "date": "2026-02-08",
        "cumDebt": 2240040052,
        "utilized": 1075234884,
        "dailySkyCharge": 108414.06
      },
      {
        "date": "2026-02-09",
        "cumDebt": 2240040052,
        "utilized": 1075005747,
        "dailySkyCharge": 108640.74
      },
      {
        "date": "2026-02-10",
        "cumDebt": 2240040052,
        "utilized": 1074933086,
        "dailySkyCharge": 108632.34
      },
      {
        "date": "2026-02-11",
        "cumDebt": 2240040052,
        "utilized": 1074851115,
        "dailySkyCharge": 108876.02
      },
      {
        "date": "2026-02-12",
        "cumDebt": 2243626295,
        "utilized": 1078359675,
        "dailySkyCharge": 109281.85
      },
      {
        "date": "2026-02-13",
        "cumDebt": 2245626295,
        "utilized": 1080280786,
        "dailySkyCharge": 108997.71
      },
      {
        "date": "2026-02-14",
        "cumDebt": 2245626295,
        "utilized": 1080280786,
        "dailySkyCharge": 108997.71
      },
      {
        "date": "2026-02-15",
        "cumDebt": 2245626295,
        "utilized": 1080280786,
        "dailySkyCharge": 108997.71
      },
      {
        "date": "2026-02-16",
        "cumDebt": 2240638279,
        "utilized": 1075086322,
        "dailySkyCharge": 108396.88
      },
      {
        "date": "2026-02-17",
        "cumDebt": 2285638279,
        "utilized": 1069993169,
        "dailySkyCharge": 108060.95
      },
      {
        "date": "2026-02-18",
        "cumDebt": 2332638836,
        "utilized": 1066931971,
        "dailySkyCharge": 107960.03
      },
      {
        "date": "2026-02-19",
        "cumDebt": 2326019522,
        "utilized": 1060224357,
        "dailySkyCharge": 106931.02
      },
      {
        "date": "2026-02-20",
        "cumDebt": 2328019522,
        "utilized": 1062130438,
        "dailySkyCharge": 107151.49
      },
      {
        "date": "2026-02-21",
        "cumDebt": 2330019522,
        "utilized": 1064130438,
        "dailySkyCharge": 107382.82
      },
      {
        "date": "2026-02-22",
        "cumDebt": 2331019522,
        "utilized": 1065130438,
        "dailySkyCharge": 107498.49
      },
      {
        "date": "2026-02-23",
        "cumDebt": 2333019522,
        "utilized": 1066865385,
        "dailySkyCharge": 107699.17
      },
      {
        "date": "2026-02-24",
        "cumDebt": 2334019522,
        "utilized": 1067778546,
        "dailySkyCharge": 107804.79
      },
      {
        "date": "2026-02-25",
        "cumDebt": 2324020522,
        "utilized": 1057685235,
        "dailySkyCharge": 106637.32
      },
      {
        "date": "2026-02-26",
        "cumDebt": 2324020522,
        "utilized": 1057601230,
        "dailySkyCharge": 106374.42
      },
      {
        "date": "2026-02-27",
        "cumDebt": 2374020522,
        "utilized": 1057524068,
        "dailySkyCharge": 106112.28
      },
      {
        "date": "2026-02-28",
        "cumDebt": 2374020522,
        "utilized": 1057524068,
        "dailySkyCharge": 106112.28
      }
    ],
    "excludedVenues": [
      {
        "id": "E14",
        "label": "AUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E25",
        "label": "Grove x Steakhouse High Yield AUSD (Monad, Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E33",
        "label": "Uniswap V3 AUSD/USDC pool (Monad, NFT positions)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E34",
        "label": "AUSD raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E35",
        "label": "USDC raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E36",
        "label": "OOB principal via 0xd94f (relay to Monad ALM EOA → AUSD acquisition)",
        "valueSom": 0,
        "valueEom": 0
      }
    ]
  },
  {
    "partner": "grove",
    "month": "2026-03",
    "periodDays": 31,
    "headline": {
      "agentRate": 6287.12,
      "distributionRewards": 191719.25,
      "primeAgentNetRevenue": -2000509.4,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": -1802503.03,
      "primeCostOfFunds": 3056810.76,
      "skySideSkyDirectExposure": 3251383.75,
      "skyRevenue": 6308194.51
    },
    "venues": [
      {
        "id": "E1",
        "label": "Aave Horizon RWA RLUSD (aToken)",
        "valueSom": 140173858.07,
        "valueEom": 135317040.98,
        "periodInflow": -5000022.22,
        "actualRev": 143205.14,
        "revenue": 143205.14,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E2",
        "label": "Aave Horizon RWA USDC (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E3",
        "label": "Aave Ethereum RLUSD (aToken)",
        "valueSom": 263125087.29,
        "valueEom": 138267796.42,
        "periodInflow": -125001099.71,
        "actualRev": 143808.85,
        "revenue": 143808.85,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E4",
        "label": "Grove x Steakhouse USDC (Morpho 4626)",
        "valueSom": 1002368.85,
        "valueEom": 3954260.4,
        "periodInflow": 2935334.38,
        "actualRev": 16557.16,
        "revenue": 16557.16,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E5",
        "label": "Grove x Steakhouse USDC High Yield (Morpho 4626)",
        "valueSom": 1012325.68,
        "valueEom": 0,
        "periodInflow": -1014076.21,
        "actualRev": 1750.54,
        "revenue": 1750.54,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E6",
        "label": "Grove x Steakhouse AUSD (Morpho 4626)",
        "valueSom": 15806005.1,
        "valueEom": 18646064.04,
        "periodInflow": 2800015.36,
        "actualRev": 40043.58,
        "revenue": 40043.58,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E7",
        "label": "Securitize Tokenized AAA CLO Fund (STAC)",
        "valueSom": 100804666.1,
        "valueEom": 100932589.9,
        "periodInflow": 0,
        "actualRev": 127923.8,
        "revenue": 127923.8,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E8",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA)",
        "valueSom": 455576922.49,
        "valueEom": 128240934.45,
        "periodInflow": -326858573.66,
        "actualRev": -477414.38,
        "revenue": 0,
        "sdRevenue": -477414.38,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E9",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 561291355.38,
        "valueEom": 1159047371.23,
        "periodInflow": 595570000,
        "actualRev": 2186015.85,
        "revenue": 0,
        "sdRevenue": 2186015.85,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E10",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 430205099.03,
        "valueEom": 706747881.32,
        "periodInflow": 274985000,
        "actualRev": 1542782.29,
        "revenue": 0,
        "sdRevenue": 1542782.29,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E11",
        "label": "Curve AUSD/USDC stableswap LP",
        "valueSom": 25000444.78,
        "valueEom": 25000938.95,
        "periodInflow": 0,
        "actualRev": 494.17,
        "revenue": 494.17,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E12",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions)",
        "valueSom": 25008038.97,
        "valueEom": 25015282.51,
        "periodInflow": 0,
        "actualRev": 7243.55,
        "revenue": 7243.55,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E13",
        "label": "RLUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E15",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 9999494.27,
        "periodInflow": 9999494.27,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E16",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E17",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E18",
        "label": "sUSDS raw / POL (ALM idle — Cat B 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E19",
        "label": "Grove x Steakhouse USDC High Yield (Base, Morpho 4626)",
        "valueSom": 1004254.24,
        "valueEom": 1007405.42,
        "periodInflow": 0,
        "actualRev": 3151.17,
        "revenue": 3151.17,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E20",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA-avalanche)",
        "valueSom": 256892910.15,
        "valueEom": 256878461.53,
        "periodInflow": 0,
        "actualRev": -14448.62,
        "revenue": -14448.62,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E21",
        "label": "Galaxy Arch CLO Token (GACLO-1)",
        "valueSom": 49900000,
        "valueEom": 49900000,
        "periodInflow": 0,
        "actualRev": 363584.08,
        "revenue": 363584.08,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E22",
        "label": "Anemoy Tokenized Apollo Diversified Credit Fund (ACRDX)",
        "valueSom": 51026217.85,
        "valueEom": 50674767.86,
        "periodInflow": 0,
        "actualRev": -351449.99,
        "revenue": -351449.99,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E23",
        "label": "Steakhouse Prime Instant (Base, Morpho V2)",
        "valueSom": 0,
        "valueEom": 16006741.13,
        "periodInflow": 15993565.71,
        "actualRev": 13175.42,
        "revenue": 13175.42,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E24",
        "label": "Steakhouse High Yield PYUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E26",
        "label": "PYUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E27",
        "label": "USDC raw on Base (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E30",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions — alt holder)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E31",
        "label": "AUSD raw (alt holder idle)",
        "valueSom": 10068.98,
        "valueEom": 10068.98,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E32",
        "label": "USDC raw (alt holder idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E37",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E38",
        "label": "Agora AUSD incentives (cash distribution to Grove Eth ALM)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 561262.52,
        "revenue": 561262.52,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2000",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2001",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2002",
        "dr": 174574.28,
        "notes": ""
      },
      {
        "refCode": "2003",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2005",
        "dr": 17144.97,
        "notes": ""
      },
      {
        "refCode": "2008",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2222",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 996033011.4242479,
      "baseRate": 0.04128728437554429,
      "referenceRate": 0.03628064516129032,
      "referenceRateKind": "tbill_3m",
      "subsidisedRate": 0.03669555805697115,
      "effectiveRate": 0.03679407153085185,
      "diffVsBaseBps": -44.93212844692437,
      "subsidyBenefit": 365834.9611412594,
      "cofAtFullBase": 3422645.721799293,
      "cofOnUtilized": 3056810.760658033,
      "skyDirectComponent": 3251383.753143241,
      "skyRevenueMax": 7972910.096261334,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "E10",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "BUIDL on Eth",
        "actualRevenue": 1542782.29,
        "sdRevenue": 1542782.29
      },
      {
        "id": "E9",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "JTRSY on Eth",
        "actualRevenue": 2186015.846365299,
        "sdRevenue": 2186015.846365299
      },
      {
        "id": "E8",
        "kind": "capped",
        "cap": 325000000,
        "start": "2025-10-23",
        "end": "2026-03-12",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3.0.6.1 — Historical SDE",
        "label": "JAAA on Eth (≤ $325M)",
        "actualRevenue": -477414.3832220577,
        "sdRevenue": -477414.3832220577
      }
    ],
    "debtDaily": [
      {
        "date": "2026-03-01",
        "cumDebt": 2374020522,
        "utilized": 1057524068,
        "dailySkyCharge": 106819.01
      },
      {
        "date": "2026-03-02",
        "cumDebt": 2425226753,
        "utilized": 1058475678,
        "dailySkyCharge": 106686.92
      },
      {
        "date": "2026-03-03",
        "cumDebt": 2425226753,
        "utilized": 1058386897,
        "dailySkyCharge": 106676.65
      },
      {
        "date": "2026-03-04",
        "cumDebt": 2435226753,
        "utilized": 1068286485,
        "dailySkyCharge": 107821.71
      },
      {
        "date": "2026-03-05",
        "cumDebt": 2421231753,
        "utilized": 1054194005,
        "dailySkyCharge": 106191.67
      },
      {
        "date": "2026-03-06",
        "cumDebt": 2371238377,
        "utilized": 1004100013,
        "dailySkyCharge": 100397.42
      },
      {
        "date": "2026-03-07",
        "cumDebt": 2371238377,
        "utilized": 1004100013,
        "dailySkyCharge": 100397.42
      },
      {
        "date": "2026-03-08",
        "cumDebt": 2371238377,
        "utilized": 1004100013,
        "dailySkyCharge": 100397.42
      },
      {
        "date": "2026-03-09",
        "cumDebt": 2351242377,
        "utilized": 983805984,
        "dailySkyCharge": 97285.23
      },
      {
        "date": "2026-03-10",
        "cumDebt": 2400317530,
        "utilized": 1032790209,
        "dailySkyCharge": 102463.13
      },
      {
        "date": "2026-03-11",
        "cumDebt": 2128458957,
        "utilized": 760834301,
        "dailySkyCharge": 75236.32
      },
      {
        "date": "2026-03-12",
        "cumDebt": 2173459307,
        "utilized": 1080736916,
        "dailySkyCharge": 107692.82
      },
      {
        "date": "2026-03-13",
        "cumDebt": 2219029307,
        "utilized": 980637055,
        "dailySkyCharge": 96971.87
      },
      {
        "date": "2026-03-14",
        "cumDebt": 2219029307,
        "utilized": 980637055,
        "dailySkyCharge": 96971.87
      },
      {
        "date": "2026-03-15",
        "cumDebt": 2219029307,
        "utilized": 980637055,
        "dailySkyCharge": 96971.87
      },
      {
        "date": "2026-03-16",
        "cumDebt": 2269029307,
        "utilized": 1030295309,
        "dailySkyCharge": 101706.43
      },
      {
        "date": "2026-03-17",
        "cumDebt": 2328029551,
        "utilized": 1039187509,
        "dailySkyCharge": 102676.33
      },
      {
        "date": "2026-03-18",
        "cumDebt": 2378029551,
        "utilized": 1039064397,
        "dailySkyCharge": 102662.91
      },
      {
        "date": "2026-03-19",
        "cumDebt": 2378039549,
        "utilized": 988975213,
        "dailySkyCharge": 97317.17
      },
      {
        "date": "2026-03-20",
        "cumDebt": 2378039549,
        "utilized": 938881377,
        "dailySkyCharge": 92387.84
      },
      {
        "date": "2026-03-21",
        "cumDebt": 2378039549,
        "utilized": 938881377,
        "dailySkyCharge": 92387.84
      },
      {
        "date": "2026-03-22",
        "cumDebt": 2392039549,
        "utilized": 952881377,
        "dailySkyCharge": 93765.46
      },
      {
        "date": "2026-03-23",
        "cumDebt": 2493039549,
        "utilized": 1003476417,
        "dailySkyCharge": 98296.56
      },
      {
        "date": "2026-03-24",
        "cumDebt": 2543039549,
        "utilized": 978325716,
        "dailySkyCharge": 95795.09
      },
      {
        "date": "2026-03-25",
        "cumDebt": 2593039549,
        "utilized": 978201706,
        "dailySkyCharge": 95782.95
      },
      {
        "date": "2026-03-26",
        "cumDebt": 2621953033,
        "utilized": 956958241,
        "dailySkyCharge": 93702.84
      },
      {
        "date": "2026-03-27",
        "cumDebt": 2681953033,
        "utilized": 966822989,
        "dailySkyCharge": 94668.77
      },
      {
        "date": "2026-03-28",
        "cumDebt": 2686953033,
        "utilized": 971822989,
        "dailySkyCharge": 95158.36
      },
      {
        "date": "2026-03-29",
        "cumDebt": 2686953033,
        "utilized": 971822989,
        "dailySkyCharge": 95158.36
      },
      {
        "date": "2026-03-30",
        "cumDebt": 2792299936,
        "utilized": 1026675145,
        "dailySkyCharge": 100342.18
      },
      {
        "date": "2026-03-31",
        "cumDebt": 2851300106,
        "utilized": 985504853,
        "dailySkyCharge": 96020.34
      }
    ],
    "excludedVenues": [
      {
        "id": "E14",
        "label": "AUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E25",
        "label": "Grove x Steakhouse High Yield AUSD (Monad, Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E33",
        "label": "Uniswap V3 AUSD/USDC pool (Monad, NFT positions)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E34",
        "label": "AUSD raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E35",
        "label": "USDC raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E36",
        "label": "OOB principal via 0xd94f (relay to Monad ALM EOA → AUSD acquisition)",
        "valueSom": 0,
        "valueEom": 0
      }
    ]
  },
  {
    "partner": "grove",
    "month": "2026-04",
    "periodDays": 30,
    "headline": {
      "agentRate": 45332.83,
      "distributionRewards": 125090.17,
      "primeAgentNetRevenue": 3682517.18,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 3852940.18,
      "primeCostOfFunds": 2940291.82,
      "skySideSkyDirectExposure": 6395006.5,
      "skyRevenue": 9335298.32
    },
    "venues": [
      {
        "id": "E1",
        "label": "Aave Horizon RWA RLUSD (aToken)",
        "valueSom": 135317040.98,
        "valueEom": 251199143.45,
        "periodInflow": 115722231.19,
        "actualRev": 159871.28,
        "revenue": 1138784.95,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E2",
        "label": "Aave Horizon RWA USDC (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E3",
        "label": "Aave Ethereum RLUSD (aToken)",
        "valueSom": 138267796.42,
        "valueEom": 0.37,
        "periodInflow": -138331420.2,
        "actualRev": 63624.15,
        "revenue": 1475521.46,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E4",
        "label": "Grove x Steakhouse USDC (Morpho 4626)",
        "valueSom": 3954260.4,
        "valueEom": 5004060.19,
        "periodInflow": 1041279.35,
        "actualRev": 8520.45,
        "revenue": 8520.45,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E5",
        "label": "Grove x Steakhouse USDC High Yield (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E6",
        "label": "Grove x Steakhouse AUSD (Morpho 4626)",
        "valueSom": 18646064.04,
        "valueEom": 24982367.89,
        "periodInflow": 6286449.18,
        "actualRev": 49854.68,
        "revenue": 49854.68,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E7",
        "label": "Securitize Tokenized AAA CLO Fund (STAC)",
        "valueSom": 100932589.9,
        "valueEom": 101506871,
        "periodInflow": 0,
        "actualRev": 574281.1,
        "revenue": 574281.1,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E8",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA)",
        "valueSom": 128240934.45,
        "valueEom": 128831404.26,
        "periodInflow": 0,
        "actualRev": 590469.81,
        "revenue": 590469.81,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E9",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 1159047371.23,
        "valueEom": 1222772366.24,
        "periodInflow": 59960119.25,
        "actualRev": 3764875.76,
        "revenue": 0,
        "sdRevenue": 3764875.76,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E10",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 706747881.32,
        "valueEom": 984378012.06,
        "periodInflow": 275000000,
        "actualRev": 2630130.74,
        "revenue": 0,
        "sdRevenue": 2630130.74,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E11",
        "label": "Curve AUSD/USDC stableswap LP",
        "valueSom": 25000938.95,
        "valueEom": 25001164.11,
        "periodInflow": 0,
        "actualRev": 225.16,
        "revenue": 225.16,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E12",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions)",
        "valueSom": 25015282.51,
        "valueEom": 25025948.07,
        "periodInflow": 0,
        "actualRev": 10665.56,
        "revenue": 10665.56,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E13",
        "label": "RLUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E15",
        "label": "USDC raw (ALM idle)",
        "valueSom": 9999494.27,
        "valueEom": 0,
        "periodInflow": -9999494.27,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E16",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E17",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E18",
        "label": "sUSDS raw / POL (ALM idle — Cat B 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E19",
        "label": "Grove x Steakhouse USDC High Yield (Base, Morpho 4626)",
        "valueSom": 1007405.42,
        "valueEom": 1010849.95,
        "periodInflow": 0,
        "actualRev": 3444.53,
        "revenue": 3444.53,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E20",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA-avalanche)",
        "valueSom": 256878461.53,
        "valueEom": 258061227.21,
        "periodInflow": 0,
        "actualRev": 1182765.68,
        "revenue": 1182765.68,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E21",
        "label": "Galaxy Arch CLO Token (GACLO-1)",
        "valueSom": 49900000,
        "valueEom": 49900000,
        "periodInflow": 0,
        "actualRev": 402742.96,
        "revenue": 402742.96,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E22",
        "label": "Anemoy Tokenized Apollo Diversified Credit Fund (ACRDX)",
        "valueSom": 50674767.86,
        "valueEom": 50865822.22,
        "periodInflow": 0,
        "actualRev": 191054.36,
        "revenue": 191054.36,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E23",
        "label": "Steakhouse Prime Instant (Base, Morpho V2)",
        "valueSom": 16006741.13,
        "valueEom": 67839910.01,
        "periodInflow": 51696274.57,
        "actualRev": 136894.3,
        "revenue": 136894.3,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E24",
        "label": "Steakhouse High Yield PYUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E26",
        "label": "PYUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E27",
        "label": "USDC raw on Base (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E30",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions — alt holder)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E31",
        "label": "AUSD raw (alt holder idle)",
        "valueSom": 10068.98,
        "valueEom": 10068.98,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E32",
        "label": "USDC raw (alt holder idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E37",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E38",
        "label": "Agora AUSD incentives (cash distribution to Grove Eth ALM)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 857584,
        "revenue": 857584,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2000",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2001",
        "dr": 82.24,
        "notes": ""
      },
      {
        "refCode": "2002",
        "dr": 116737.37,
        "notes": ""
      },
      {
        "refCode": "2003",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2005",
        "dr": 8259.88,
        "notes": ""
      },
      {
        "refCode": "2008",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2222",
        "dr": 10.68,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 976625153.4840184,
      "baseRate": 0.04030997361747411,
      "referenceRate": 0.03686666666666667,
      "referenceRateKind": "tbill_3m",
      "subsidisedRate": 0.0372972837362202,
      "effectiveRate": 0.03730709608600075,
      "diffVsBaseBps": -30.02877531473362,
      "subsidyBenefit": 232061.9088782076,
      "cofAtFullBase": 3172353.724369952,
      "cofOnUtilized": 2940291.815491744,
      "skyDirectComponent": 6395006.500245043,
      "skyRevenueMax": 10336519.98374095,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "E10",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "BUIDL on Eth",
        "actualRevenue": 2630130.74,
        "sdRevenue": 2630130.74
      },
      {
        "id": "E9",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "JTRSY on Eth",
        "actualRevenue": 3764875.760245043,
        "sdRevenue": 3764875.760245043
      },
      {
        "id": "E8",
        "kind": "capped",
        "cap": 325000000,
        "start": "2025-10-23",
        "end": "2026-03-12",
        "active": false,
        "source": "Atlas A.2.2.9.1.1.1.1.3.0.6.1 — Historical SDE",
        "label": "JAAA on Eth (≤ $325M)",
        "actualRevenue": 590469.8089325136,
        "sdRevenue": 0
      }
    ],
    "debtDaily": [
      {
        "date": "2026-04-01",
        "cumDebt": 2902299106,
        "utilized": 986310351,
        "dailySkyCharge": 96621.74
      },
      {
        "date": "2026-04-02",
        "cumDebt": 2942299611,
        "utilized": 976142033,
        "dailySkyCharge": 95625.63
      },
      {
        "date": "2026-04-03",
        "cumDebt": 2942299611,
        "utilized": 975699580,
        "dailySkyCharge": 95582.28
      },
      {
        "date": "2026-04-04",
        "cumDebt": 2942299611,
        "utilized": 950699580,
        "dailySkyCharge": 93133.21
      },
      {
        "date": "2026-04-05",
        "cumDebt": 2942299611,
        "utilized": 950699580,
        "dailySkyCharge": 93133.21
      },
      {
        "date": "2026-04-06",
        "cumDebt": 2993299611,
        "utilized": 951408839,
        "dailySkyCharge": 96282.11
      },
      {
        "date": "2026-04-07",
        "cumDebt": 3092300857,
        "utilized": 1000237800,
        "dailySkyCharge": 101225.45
      },
      {
        "date": "2026-04-08",
        "cumDebt": 3144300857,
        "utilized": 977019400,
        "dailySkyCharge": 98873.89
      },
      {
        "date": "2026-04-09",
        "cumDebt": 3171300857,
        "utilized": 978793769,
        "dailySkyCharge": 99053.45
      },
      {
        "date": "2026-04-10",
        "cumDebt": 3243944282,
        "utilized": 976208183,
        "dailySkyCharge": 98791.79
      },
      {
        "date": "2026-04-11",
        "cumDebt": 3243944282,
        "utilized": 976208183,
        "dailySkyCharge": 98791.79
      },
      {
        "date": "2026-04-12",
        "cumDebt": 3243944282,
        "utilized": 976208183,
        "dailySkyCharge": 98791.79
      },
      {
        "date": "2026-04-13",
        "cumDebt": 3343944282,
        "utilized": 1000594286,
        "dailySkyCharge": 101033.27
      },
      {
        "date": "2026-04-14",
        "cumDebt": 3343944282,
        "utilized": 950404439,
        "dailySkyCharge": 95960.86
      },
      {
        "date": "2026-04-15",
        "cumDebt": 3457644282,
        "utilized": 1063896292,
        "dailySkyCharge": 107937.81
      },
      {
        "date": "2026-04-16",
        "cumDebt": 3455786805,
        "utilized": 966849753,
        "dailySkyCharge": 97621.32
      },
      {
        "date": "2026-04-17",
        "cumDebt": 3443791779,
        "utilized": 954571725,
        "dailySkyCharge": 96381.63
      },
      {
        "date": "2026-04-18",
        "cumDebt": 3437781540,
        "utilized": 948561486,
        "dailySkyCharge": 95774.78
      },
      {
        "date": "2026-04-19",
        "cumDebt": 3452781540,
        "utilized": 963561486,
        "dailySkyCharge": 97289.31
      },
      {
        "date": "2026-04-20",
        "cumDebt": 3458781540,
        "utilized": 968848763,
        "dailySkyCharge": 97823.16
      },
      {
        "date": "2026-04-21",
        "cumDebt": 3458781761,
        "utilized": 968601959,
        "dailySkyCharge": 97798.24
      },
      {
        "date": "2026-04-22",
        "cumDebt": 3463781761,
        "utilized": 973365300,
        "dailySkyCharge": 97956.88
      },
      {
        "date": "2026-04-23",
        "cumDebt": 3462781841,
        "utilized": 1022132049,
        "dailySkyCharge": 102992.86
      },
      {
        "date": "2026-04-24",
        "cumDebt": 3363717598,
        "utilized": 972840520,
        "dailySkyCharge": 97904.07
      },
      {
        "date": "2026-04-25",
        "cumDebt": 3364717598,
        "utilized": 973840520,
        "dailySkyCharge": 98004.71
      },
      {
        "date": "2026-04-26",
        "cumDebt": 3365717598,
        "utilized": 974840520,
        "dailySkyCharge": 98105.35
      },
      {
        "date": "2026-04-27",
        "cumDebt": 3322994730,
        "utilized": 981465019,
        "dailySkyCharge": 98091.47
      },
      {
        "date": "2026-04-28",
        "cumDebt": 3272990188,
        "utilized": 981246732,
        "dailySkyCharge": 98069.66
      },
      {
        "date": "2026-04-29",
        "cumDebt": 3221802586,
        "utilized": 979849006,
        "dailySkyCharge": 97929.96
      },
      {
        "date": "2026-04-30",
        "cumDebt": 3184799649,
        "utilized": 977649271,
        "dailySkyCharge": 97710.11
      }
    ],
    "excludedVenues": [
      {
        "id": "E14",
        "label": "AUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 1000462.31
      },
      {
        "id": "E25",
        "label": "Grove x Steakhouse High Yield AUSD (Monad, Morpho 4626)",
        "valueSom": 6504464.08,
        "valueEom": 0
      },
      {
        "id": "E33",
        "label": "Uniswap V3 AUSD/USDC pool (Monad, NFT positions)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E34",
        "label": "AUSD raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E35",
        "label": "USDC raw (Monad, alt holder idle)",
        "valueSom": 207788.13,
        "valueEom": 207788.13
      },
      {
        "id": "E36",
        "label": "OOB principal via 0xd94f (relay to Monad ALM EOA → AUSD acquisition)",
        "valueSom": 50001000,
        "valueEom": 50001000
      }
    ]
  },
  {
    "partner": "grove",
    "month": "2026-05",
    "periodDays": 31,
    "headline": {
      "agentRate": 71960.6,
      "distributionRewards": 20518.52,
      "primeAgentNetRevenue": 289318.76,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 381797.87,
      "primeCostOfFunds": 3345973.19,
      "skySideSkyDirectExposure": 5242531.29,
      "skyRevenue": 8588504.48
    },
    "venues": [
      {
        "id": "E1",
        "label": "Aave Horizon RWA RLUSD (aToken)",
        "valueSom": 251199143.45,
        "valueEom": 251453941.65,
        "periodInflow": 0,
        "actualRev": 254798.2,
        "revenue": 254798.2,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E2",
        "label": "Aave Horizon RWA USDC (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E3",
        "label": "Aave Ethereum RLUSD (aToken)",
        "valueSom": 0.37,
        "valueEom": 0.37,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E4",
        "label": "Grove x Steakhouse USDC (Morpho 4626)",
        "valueSom": 5004060.19,
        "valueEom": 9022511.56,
        "periodInflow": 4000157.17,
        "actualRev": 18294.2,
        "revenue": 18294.2,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E5",
        "label": "Grove x Steakhouse USDC High Yield (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E6",
        "label": "Grove x Steakhouse AUSD (Morpho 4626)",
        "valueSom": 24982367.89,
        "valueEom": 25056434.04,
        "periodInflow": 0,
        "actualRev": 74066.15,
        "revenue": 74066.15,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E7",
        "label": "Securitize Tokenized AAA CLO Fund (STAC)",
        "valueSom": 101506871,
        "valueEom": 101959976.3,
        "periodInflow": 0,
        "actualRev": 453105.3,
        "revenue": 453105.3,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E8",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA)",
        "valueSom": 128831404.26,
        "valueEom": 129327373.13,
        "periodInflow": 0,
        "actualRev": 495968.87,
        "revenue": 495968.87,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E9",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 1222772366.24,
        "valueEom": 850436206.66,
        "periodInflow": -375108226.95,
        "actualRev": 2772067.37,
        "revenue": 0,
        "sdRevenue": 2772067.37,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E10",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 984378012.06,
        "valueEom": 711851475.98,
        "periodInflow": -274997000,
        "actualRev": 2470463.92,
        "revenue": 0,
        "sdRevenue": 2470463.92,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "E11",
        "label": "Curve AUSD/USDC stableswap LP",
        "valueSom": 25001164.11,
        "valueEom": 25001443.91,
        "periodInflow": 0,
        "actualRev": 279.8,
        "revenue": 279.8,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E12",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions)",
        "valueSom": 25025948.07,
        "valueEom": 25037160.42,
        "periodInflow": 0,
        "actualRev": 11212.35,
        "revenue": 11212.35,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E13",
        "label": "RLUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 49596,
        "periodInflow": 0,
        "actualRev": 49596,
        "revenue": 49596,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E15",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E16",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E17",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E18",
        "label": "sUSDS raw / POL (ALM idle — Cat B 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E19",
        "label": "Grove x Steakhouse USDC High Yield (Base, Morpho 4626)",
        "valueSom": 1010849.95,
        "valueEom": 1014520.9,
        "periodInflow": 0,
        "actualRev": 3670.95,
        "revenue": 3670.95,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E20",
        "label": "Janus Henderson Anemoy AAA CLO (JAAA-avalanche)",
        "valueSom": 258061227.21,
        "valueEom": 259054698.77,
        "periodInflow": 0,
        "actualRev": 993471.56,
        "revenue": 993471.56,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E21",
        "label": "Galaxy Arch CLO Token (GACLO-1)",
        "valueSom": 49900000,
        "valueEom": 46308344.52,
        "periodInflow": 0,
        "actualRev": 389109.9,
        "revenue": 389109.9,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E22",
        "label": "Anemoy Tokenized Apollo Diversified Credit Fund (ACRDX)",
        "valueSom": 50865822.22,
        "valueEom": 32739638.94,
        "periodInflow": -18077669.47,
        "actualRev": -48513.8,
        "revenue": -48513.8,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E23",
        "label": "Steakhouse Prime Instant (Base, Morpho V2)",
        "valueSom": 67839910.01,
        "valueEom": 103110534.95,
        "periodInflow": 35001291.88,
        "actualRev": 269333.06,
        "revenue": 269333.06,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E24",
        "label": "Steakhouse High Yield PYUSD (Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E26",
        "label": "PYUSD raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E27",
        "label": "USDC raw on Base (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E30",
        "label": "Uniswap V3 AUSD/USDC pool (NFT positions — alt holder)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E31",
        "label": "AUSD raw (alt holder idle)",
        "valueSom": 10068.98,
        "valueEom": 10068.98,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E32",
        "label": "USDC raw (alt holder idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E37",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 0,
        "valueEom": 100275383.22,
        "periodInflow": 100002808.74,
        "actualRev": 272574.48,
        "revenue": 272574.48,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "E38",
        "label": "Agora AUSD incentives (cash distribution to Grove Eth ALM)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 398324.92,
        "revenue": 398324.92,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2000",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2001",
        "dr": 8467.99,
        "notes": ""
      },
      {
        "refCode": "2002",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2003",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2005",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "2008",
        "dr": 12035.78,
        "notes": ""
      },
      {
        "refCode": "2222",
        "dr": 14.75,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 1070796625.540224,
      "baseRate": 0.03951024672617314,
      "referenceRate": 0.03689032258064516,
      "referenceRateKind": "tbill_3m",
      "subsidisedRate": 0.03732734186107307,
      "effectiveRate": 0.03747483383441957,
      "diffVsBaseBps": -20.35412891753571,
      "subsidyBenefit": 178277.9868267714,
      "cofAtFullBase": 3524251.177648756,
      "cofOnUtilized": 3345973.190821985,
      "skyDirectComponent": 5242531.28537233,
      "skyRevenueMax": 9534049.06224379,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "E10",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "BUIDL on Eth",
        "actualRevenue": 2470463.92,
        "sdRevenue": 2470463.92
      },
      {
        "id": "E9",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "JTRSY on Eth",
        "actualRevenue": 2772067.36537233,
        "sdRevenue": 2772067.36537233
      },
      {
        "id": "E8",
        "kind": "capped",
        "cap": 325000000,
        "start": "2025-10-23",
        "end": "2026-03-12",
        "active": false,
        "source": "Atlas A.2.2.9.1.1.1.1.3.0.6.1 — Historical SDE",
        "label": "JAAA on Eth (≤ $325M)",
        "actualRevenue": 495968.8736986459,
        "sdRevenue": 0
      }
    ],
    "debtDaily": [
      {
        "date": "2026-05-01",
        "cumDebt": 3181207994,
        "utilized": 1023829638,
        "dailySkyCharge": 102789.38
      },
      {
        "date": "2026-05-02",
        "cumDebt": 3181207994,
        "utilized": 1023829638,
        "dailySkyCharge": 102789.38
      },
      {
        "date": "2026-05-03",
        "cumDebt": 3181207994,
        "utilized": 1023829638,
        "dailySkyCharge": 102789.38
      },
      {
        "date": "2026-05-04",
        "cumDebt": 3131188096,
        "utilized": 1023192367,
        "dailySkyCharge": 103161.78
      },
      {
        "date": "2026-05-05",
        "cumDebt": 3081184252,
        "utilized": 973007934,
        "dailySkyCharge": 97975.48
      },
      {
        "date": "2026-05-06",
        "cumDebt": 3082184252,
        "utilized": 973803861,
        "dailySkyCharge": 98055.62
      },
      {
        "date": "2026-05-07",
        "cumDebt": 3082184252,
        "utilized": 973597157,
        "dailySkyCharge": 98034.81
      },
      {
        "date": "2026-05-08",
        "cumDebt": 3131184328,
        "utilized": 1022396082,
        "dailySkyCharge": 103077.03
      },
      {
        "date": "2026-05-09",
        "cumDebt": 3131184328,
        "utilized": 1022396082,
        "dailySkyCharge": 103077.03
      },
      {
        "date": "2026-05-10",
        "cumDebt": 3131184328,
        "utilized": 1022396082,
        "dailySkyCharge": 103077.03
      },
      {
        "date": "2026-05-11",
        "cumDebt": 3148116029,
        "utilized": 1088730690,
        "dailySkyCharge": 110137.08
      },
      {
        "date": "2026-05-12",
        "cumDebt": 3125114750,
        "utilized": 1065557953,
        "dailySkyCharge": 107670.78
      },
      {
        "date": "2026-05-13",
        "cumDebt": 3098127250,
        "utilized": 1088386090,
        "dailySkyCharge": 110100.4
      },
      {
        "date": "2026-05-14",
        "cumDebt": 3049133871,
        "utilized": 1089206574,
        "dailySkyCharge": 110187.72
      },
      {
        "date": "2026-05-15",
        "cumDebt": 3024125400,
        "utilized": 1114011912,
        "dailySkyCharge": 112827.78
      },
      {
        "date": "2026-05-16",
        "cumDebt": 3024125400,
        "utilized": 1114011912,
        "dailySkyCharge": 112827.78
      },
      {
        "date": "2026-05-17",
        "cumDebt": 3024125400,
        "utilized": 1114011912,
        "dailySkyCharge": 112827.78
      },
      {
        "date": "2026-05-18",
        "cumDebt": 3024125400,
        "utilized": 1163464518,
        "dailySkyCharge": 117650.83
      },
      {
        "date": "2026-05-19",
        "cumDebt": 2927122354,
        "utilized": 1116269333,
        "dailySkyCharge": 112627.81
      },
      {
        "date": "2026-05-20",
        "cumDebt": 2857131782,
        "utilized": 1096098867,
        "dailySkyCharge": 110481.05
      },
      {
        "date": "2026-05-21",
        "cumDebt": 2811136939,
        "utilized": 1099922921,
        "dailySkyCharge": 110888.05
      },
      {
        "date": "2026-05-22",
        "cumDebt": 2757146241,
        "utilized": 1095805093,
        "dailySkyCharge": 110449.79
      },
      {
        "date": "2026-05-23",
        "cumDebt": 2758146241,
        "utilized": 1096805093,
        "dailySkyCharge": 110556.22
      },
      {
        "date": "2026-05-24",
        "cumDebt": 2760146241,
        "utilized": 1098805093,
        "dailySkyCharge": 110769.08
      },
      {
        "date": "2026-05-25",
        "cumDebt": 2763146241,
        "utilized": 1101489037,
        "dailySkyCharge": 111054.73
      },
      {
        "date": "2026-05-26",
        "cumDebt": 2712152914,
        "utilized": 1100210236,
        "dailySkyCharge": 110565.34
      },
      {
        "date": "2026-05-27",
        "cumDebt": 2664162487,
        "utilized": 1102082743,
        "dailySkyCharge": 110762.16
      },
      {
        "date": "2026-05-28",
        "cumDebt": 2647157440,
        "utilized": 1084937666,
        "dailySkyCharge": 108960.06
      },
      {
        "date": "2026-05-29",
        "cumDebt": 2652157440,
        "utilized": 1089869757,
        "dailySkyCharge": 109478.47
      },
      {
        "date": "2026-05-30",
        "cumDebt": 2657157440,
        "utilized": 1094869757,
        "dailySkyCharge": 110004.01
      },
      {
        "date": "2026-05-31",
        "cumDebt": 2660157440,
        "utilized": 1097869757,
        "dailySkyCharge": 110319.34
      }
    ],
    "excludedVenues": [
      {
        "id": "E14",
        "label": "AUSD raw (ALM idle)",
        "valueSom": 1000462.31,
        "valueEom": 3398082.92
      },
      {
        "id": "E25",
        "label": "Grove x Steakhouse High Yield AUSD (Monad, Morpho 4626)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E33",
        "label": "Uniswap V3 AUSD/USDC pool (Monad, NFT positions)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E34",
        "label": "AUSD raw (Monad, alt holder idle)",
        "valueSom": 0,
        "valueEom": 0
      },
      {
        "id": "E35",
        "label": "USDC raw (Monad, alt holder idle)",
        "valueSom": 207788.13,
        "valueEom": 207788.13
      },
      {
        "id": "E36",
        "label": "OOB principal via 0xd94f (relay to Monad ALM EOA → AUSD acquisition)",
        "valueSom": 50001000,
        "valueEom": 50001000
      }
    ]
  },
  {
    "partner": "keel",
    "month": "2026-01",
    "periodDays": 31,
    "headline": {
      "agentRate": 0,
      "distributionRewards": 28435.59,
      "primeAgentNetRevenue": 0,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 28435.59,
      "primeCostOfFunds": 0,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 0
    },
    "venues": [],
    "refCodes": [
      {
        "refCode": "4001",
        "dr": 28435.59,
        "notes": "Synthetic code: USDS in Solana OFT Bridge (0x1e1D42781FC170EF9da004Fb735f56F0276d01B8). No on-chain Referral event; entire contract balance attributed. XR rate."
      },
      {
        "refCode": "4011",
        "dr": 0,
        "notes": "Included in aggregators, needs methodology update. 1inch"
      },
      {
        "refCode": "4012",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 0,
      "skyDirectComponent": 0,
      "skyRevenueMax": null,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [],
    "excludedVenues": []
  },
  {
    "partner": "keel",
    "month": "2026-02",
    "periodDays": 28,
    "headline": {
      "agentRate": 0,
      "distributionRewards": 25260.48,
      "primeAgentNetRevenue": 0,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 25260.48,
      "primeCostOfFunds": 0,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 0
    },
    "venues": [],
    "refCodes": [
      {
        "refCode": "4001",
        "dr": 25260.48,
        "notes": "Synthetic code: USDS in Solana OFT Bridge (0x1e1D42781FC170EF9da004Fb735f56F0276d01B8). No on-chain Referral event; entire contract balance attributed. XR rate."
      },
      {
        "refCode": "4011",
        "dr": 0,
        "notes": "Included in aggregators, needs methodology update. 1inch"
      },
      {
        "refCode": "4012",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 0,
      "skyDirectComponent": 0,
      "skyRevenueMax": null,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [],
    "excludedVenues": []
  },
  {
    "partner": "keel",
    "month": "2026-03",
    "periodDays": 31,
    "headline": {
      "agentRate": 2126.8,
      "distributionRewards": 29059.5,
      "primeAgentNetRevenue": 0,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 31186.3,
      "primeCostOfFunds": 0,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 0
    },
    "venues": [],
    "refCodes": [
      {
        "refCode": "4001",
        "dr": 29059.5,
        "notes": "Synthetic code: USDS in Solana OFT Bridge (0x1e1D42781FC170EF9da004Fb735f56F0276d01B8). No on-chain Referral event; entire contract balance attributed. XR rate."
      },
      {
        "refCode": "4011",
        "dr": 0,
        "notes": "Included in aggregators, needs methodology update. 1inch"
      },
      {
        "refCode": "4012",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 0,
      "skyDirectComponent": 0,
      "skyRevenueMax": null,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [],
    "excludedVenues": []
  },
  {
    "partner": "keel",
    "month": "2026-04",
    "periodDays": 30,
    "headline": {
      "agentRate": 31676.69,
      "distributionRewards": 23206.77,
      "primeAgentNetRevenue": 0,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 54883.46,
      "primeCostOfFunds": 0,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 0
    },
    "venues": [],
    "refCodes": [
      {
        "refCode": "4001",
        "dr": 23206.77,
        "notes": "Synthetic code: USDS in Solana OFT Bridge (0x1e1D42781FC170EF9da004Fb735f56F0276d01B8). No on-chain Referral event; entire contract balance attributed. XR rate."
      },
      {
        "refCode": "4011",
        "dr": 0,
        "notes": "Included in aggregators, needs methodology update. 1inch"
      },
      {
        "refCode": "4012",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 0,
      "skyDirectComponent": 0,
      "skyRevenueMax": null,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [],
    "excludedVenues": []
  },
  {
    "partner": "keel",
    "month": "2026-05",
    "periodDays": 31,
    "headline": {
      "agentRate": 32278.71,
      "distributionRewards": 22600.1,
      "primeAgentNetRevenue": 0,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 54878.81,
      "primeCostOfFunds": 0,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 0
    },
    "venues": [],
    "refCodes": [
      {
        "refCode": "4001",
        "dr": 22600.1,
        "notes": "Synthetic code: USDS in Solana OFT Bridge (0x1e1D42781FC170EF9da004Fb735f56F0276d01B8). No on-chain Referral event; entire contract balance attributed. XR rate."
      },
      {
        "refCode": "4011",
        "dr": 0.01,
        "notes": "Included in aggregators, needs methodology update. 1inch"
      },
      {
        "refCode": "4012",
        "dr": 0,
        "notes": ""
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 0,
      "skyDirectComponent": 0,
      "skyRevenueMax": null,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [],
    "excludedVenues": []
  },
  {
    "partner": "obex",
    "month": "2026-01",
    "periodDays": 31,
    "headline": {
      "agentRate": 73520.27,
      "distributionRewards": null,
      "primeAgentNetRevenue": 439227.68,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 512747.96,
      "primeCostOfFunds": 2110933.27,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 2110933.27
    },
    "venues": [
      {
        "id": "V1",
        "label": "Maple syrupUSDC (Category B — ERC-4626 vault)",
        "valueSom": 471768772.81,
        "valueEom": 604322210.79,
        "periodInflow": 130003277.03,
        "actualRev": 2550160.95,
        "revenue": 2550160.95,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 2110933.271411708,
      "skyDirectComponent": 0,
      "skyRevenueMax": 2110933.271411708,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [
      {
        "date": "2026-01-01",
        "cumDebt": 490000000,
        "utilized": 490000000,
        "dailySkyCharge": 56677.11
      },
      {
        "date": "2026-01-02",
        "cumDebt": 510000000,
        "utilized": 510000000,
        "dailySkyCharge": 58990.46
      },
      {
        "date": "2026-01-03",
        "cumDebt": 530000000,
        "utilized": 530000000,
        "dailySkyCharge": 61303.82
      },
      {
        "date": "2026-01-04",
        "cumDebt": 550000000,
        "utilized": 550000000,
        "dailySkyCharge": 63617.17
      },
      {
        "date": "2026-01-05",
        "cumDebt": 570000000,
        "utilized": 570000000,
        "dailySkyCharge": 65930.52
      },
      {
        "date": "2026-01-06",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-07",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-08",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-09",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-10",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-11",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-12",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-13",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-14",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-15",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-16",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-17",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-18",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-19",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-20",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-21",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-22",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-23",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-24",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-25",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-26",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-27",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-28",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-29",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-30",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-01-31",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      }
    ],
    "excludedVenues": []
  },
  {
    "partner": "obex",
    "month": "2026-02",
    "periodDays": 28,
    "headline": {
      "agentRate": 67754.17,
      "distributionRewards": null,
      "primeAgentNetRevenue": 170350.31,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 238104.48,
      "primeCostOfFunds": 1948739.35,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 1948739.35
    },
    "venues": [
      {
        "id": "V1",
        "label": "Maple syrupUSDC (Category B — ERC-4626 vault)",
        "valueSom": 604322210.79,
        "valueEom": 606441300.46,
        "periodInflow": 0,
        "actualRev": 2119089.66,
        "revenue": 2119089.66,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 1948739.350653602,
      "skyDirectComponent": 0,
      "skyRevenueMax": 1948739.350653602,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [
      {
        "date": "2026-02-01",
        "cumDebt": 600000000,
        "utilized": 600000000,
        "dailySkyCharge": 69400.55
      },
      {
        "date": "2026-02-02",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-03",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-04",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-05",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-06",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-07",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-08",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-09",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-10",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-11",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-12",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-13",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-14",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-15",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-16",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-17",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-18",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-19",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-20",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-21",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-22",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-23",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-24",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-25",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-26",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-27",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-02-28",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      }
    ],
    "excludedVenues": []
  },
  {
    "partner": "obex",
    "month": "2026-03",
    "periodDays": 31,
    "headline": {
      "agentRate": 72061.47,
      "distributionRewards": null,
      "primeAgentNetRevenue": 153517.58,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 225579.04,
      "primeCostOfFunds": 2073865.93,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 2073865.93
    },
    "venues": [
      {
        "id": "V1",
        "label": "Maple syrupUSDC (Category B — ERC-4626 vault)",
        "valueSom": 606441300.46,
        "valueEom": 608668683.96,
        "periodInflow": 0,
        "actualRev": 2227383.5,
        "revenue": 2227383.5,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 2073865.926141798,
      "skyDirectComponent": 0,
      "skyRevenueMax": 2073865.926141798,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [
      {
        "date": "2026-03-01",
        "cumDebt": 601768819,
        "utilized": 601768819,
        "dailySkyCharge": 69605.14
      },
      {
        "date": "2026-03-02",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-03",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-04",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-05",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-06",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-07",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-08",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 69847.55
      },
      {
        "date": "2026-03-09",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-10",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-11",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-12",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-13",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-14",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-15",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-16",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-17",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-18",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-19",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-20",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-21",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-22",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-23",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-24",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-25",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-26",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-27",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-28",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-29",
        "cumDebt": 603864594,
        "utilized": 603864594,
        "dailySkyCharge": 65865.34
      },
      {
        "date": "2026-03-30",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-03-31",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      }
    ],
    "excludedVenues": []
  },
  {
    "partner": "obex",
    "month": "2026-04",
    "periodDays": 30,
    "headline": {
      "agentRate": 68358.25,
      "distributionRewards": null,
      "primeAgentNetRevenue": 262250.32,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 330608.56,
      "primeCostOfFunds": 1968813.08,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 1968813.08
    },
    "venues": [
      {
        "id": "V1",
        "label": "Maple syrupUSDC (Category B — ERC-4626 vault)",
        "valueSom": 608668683.96,
        "valueEom": 610899747.35,
        "periodInflow": 0,
        "actualRev": 2231063.39,
        "revenue": 2231063.39,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 1968813.075256201,
      "skyDirectComponent": 0,
      "skyRevenueMax": 1968813.075256201,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [
      {
        "date": "2026-04-01",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-02",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-03",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-04",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-05",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-06",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-07",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-08",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-09",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-10",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-11",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-12",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-13",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-14",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-15",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-16",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-17",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-18",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-19",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-20",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-21",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 66077.86
      },
      {
        "date": "2026-04-22",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 64477.15
      },
      {
        "date": "2026-04-23",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 64477.15
      },
      {
        "date": "2026-04-24",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 64477.15
      },
      {
        "date": "2026-04-25",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 64477.15
      },
      {
        "date": "2026-04-26",
        "cumDebt": 605813016,
        "utilized": 605813016,
        "dailySkyCharge": 64477.15
      },
      {
        "date": "2026-04-27",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-04-28",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-04-29",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-04-30",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      }
    ],
    "excludedVenues": []
  },
  {
    "partner": "obex",
    "month": "2026-05",
    "periodDays": 31,
    "headline": {
      "agentRate": 69563.01,
      "distributionRewards": null,
      "primeAgentNetRevenue": 456640.85,
      "primeSideSkyDirectExposure": 0,
      "primeAgentProfit": 526203.86,
      "primeCostOfFunds": 2005204.07,
      "skySideSkyDirectExposure": 0,
      "skyRevenue": 2005204.07
    },
    "venues": [
      {
        "id": "V1",
        "label": "Maple syrupUSDC (Category B — ERC-4626 vault)",
        "valueSom": 610899747.35,
        "valueEom": 613361592.27,
        "periodInflow": 0,
        "actualRev": 2461844.92,
        "revenue": 2461844.92,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [],
    "rateBuild": {
      "timeWeightedUtilized": null,
      "baseRate": null,
      "referenceRate": null,
      "referenceRateKind": null,
      "subsidisedRate": null,
      "effectiveRate": null,
      "diffVsBaseBps": null,
      "subsidyBenefit": null,
      "cofAtFullBase": null,
      "cofOnUtilized": 2005204.072832809,
      "skyDirectComponent": 0,
      "skyRevenueMax": 2005204.072832809,
      "subsidyEnabled": null,
      "capUsd": null
    },
    "skyDirect": [],
    "debtDaily": [
      {
        "date": "2026-05-01",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-02",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-03",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-04",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-05",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-06",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-07",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-08",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-09",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-10",
        "cumDebt": 607888664,
        "utilized": 607888664,
        "dailySkyCharge": 64698.06
      },
      {
        "date": "2026-05-11",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-12",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-13",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-14",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-15",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-16",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-17",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-18",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-19",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-20",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-21",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-22",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-23",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-24",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-25",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64907.67
      },
      {
        "date": "2026-05-26",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64101.39
      },
      {
        "date": "2026-05-27",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64101.39
      },
      {
        "date": "2026-05-28",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64101.39
      },
      {
        "date": "2026-05-29",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64101.39
      },
      {
        "date": "2026-05-30",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64101.39
      },
      {
        "date": "2026-05-31",
        "cumDebt": 609858163,
        "utilized": 609858163,
        "dailySkyCharge": 64101.39
      }
    ],
    "excludedVenues": []
  },
  {
    "partner": "spark",
    "month": "2026-01",
    "periodDays": 31,
    "headline": {
      "agentRate": 106392.55,
      "distributionRewards": 1154488.13,
      "primeAgentNetRevenue": -344340.78,
      "primeSideSkyDirectExposure": 25473.95,
      "primeAgentProfit": 942013.86,
      "primeCostOfFunds": 7822171.39,
      "skySideSkyDirectExposure": 2023.08,
      "skyRevenue": 7824194.47
    },
    "venues": [
      {
        "id": "S1",
        "label": "Spark USDS (SparkLend spToken)",
        "valueSom": 177429260.51,
        "valueEom": 556639355.91,
        "periodInflow": 378751816.89,
        "actualRev": 458278.51,
        "revenue": 458278.51,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S2",
        "label": "Spark USDC (SparkLend spToken)",
        "valueSom": 43177397.52,
        "valueEom": 43659321.09,
        "periodInflow": 336431.14,
        "actualRev": 145492.43,
        "revenue": 145492.43,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S3",
        "label": "Spark USDT (SparkLend spToken)",
        "valueSom": 339412952.95,
        "valueEom": 220863532.36,
        "periodInflow": -119515986.19,
        "actualRev": 966565.6,
        "revenue": 966565.6,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S4",
        "label": "Spark DAI (SparkLend spToken)",
        "valueSom": 332838656.14,
        "valueEom": 305426388.32,
        "periodInflow": -28309659.9,
        "actualRev": 897392.08,
        "revenue": 897392.08,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S5",
        "label": "Spark PYUSD (SparkLend spToken)",
        "valueSom": 144386807.12,
        "valueEom": 99995755.66,
        "periodInflow": -44629741.29,
        "actualRev": 238689.83,
        "revenue": 238689.83,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S6",
        "label": "Aave Ethereum Lido USDS (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S7",
        "label": "Aave Ethereum USDS (aToken)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S8",
        "label": "Aave Ethereum USDC (aToken)",
        "valueSom": 0.06,
        "valueEom": 0.06,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S9",
        "label": "Aave Ethereum USDT (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S10",
        "label": "Spark Blue Chip USDC Vault (Morpho)",
        "valueSom": 10124757.36,
        "valueEom": 976334.44,
        "periodInflow": -9171336.56,
        "actualRev": 22913.63,
        "revenue": 22913.63,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S11",
        "label": "Spark Blue Chip USDT Vault (Morpho V2)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S12",
        "label": "Spark DAI Vault (Morpho)",
        "valueSom": 286.49,
        "valueEom": 332.92,
        "periodInflow": 44.05,
        "actualRev": 2.38,
        "revenue": 2.38,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S13",
        "label": "Spark USDS Vault (Morpho)",
        "valueSom": 21.89,
        "valueEom": 21.91,
        "periodInflow": 0.01,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S14",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 300001048.43,
        "valueEom": 100000608.93,
        "periodInflow": -200851344.96,
        "actualRev": 850905.46,
        "revenue": 850905.46,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S15",
        "label": "Maple syrupUSDT (ERC-4626)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S16",
        "label": "Ethena Staked USDe (sUSDe)",
        "valueSom": 98.22,
        "valueEom": 98.61,
        "periodInflow": 0,
        "actualRev": 0.39,
        "revenue": 0.39,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S17",
        "label": "Fluid Savings USDS (fsUSDS)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S18",
        "label": "Arkis Spark Prime USDC 1 (ERC-4626)",
        "valueSom": 15024030.59,
        "valueEom": 15106645.24,
        "periodInflow": 0,
        "actualRev": 82614.64,
        "revenue": 82614.64,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S19",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S20",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S21",
        "label": "Superstate Short Duration US Government Securities Fund (USTB)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S22",
        "label": "Superstate Crypto Carry Fund (USCC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S23",
        "label": "Anchorage tri-party loan escrow (USDC pass-through, ~$0 balance)",
        "valueSom": 1.11,
        "valueEom": 1.21,
        "periodInflow": 0,
        "actualRev": 0.1,
        "revenue": 0.1,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S24",
        "label": "Spark.fi USDT Reserve Curve (sUSDS/USDT)",
        "valueSom": 50000864.48,
        "valueEom": 49999911.75,
        "periodInflow": -28449.77,
        "actualRev": 2023.08,
        "revenue": 25473.95,
        "sdRevenue": 2023.08,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S25",
        "label": "Spark.fi PYUSD Reserve Curve (PYUSD/USDS)",
        "valueSom": 100000415.95,
        "valueEom": 100000425.55,
        "periodInflow": -7422.05,
        "actualRev": 7431.66,
        "revenue": 7431.66,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S26",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": -891780,
        "actualRev": 891780,
        "revenue": 891780,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S27",
        "label": "USDT raw (ALM idle — $442M as of 2026-04)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S28",
        "label": "PYUSD raw (ALM idle — $677M as of 2026-04)",
        "valueSom": 478728977.46,
        "valueEom": 524852622.17,
        "periodInflow": 46123644.72,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S29",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S30",
        "label": "USDe raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S31",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S32",
        "label": "sUSDS raw / POL (ALM — Cat B 4626, demand-side spread)",
        "valueSom": 529568618.85,
        "valueEom": 393521575.97,
        "periodInflow": -137782501.86,
        "actualRev": 1133974.66,
        "revenue": 1133974.66,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S34",
        "label": "Spark USDC Vault (Morpho, Base)",
        "valueSom": 167771852.13,
        "valueEom": 61.15,
        "periodInflow": -167989912.44,
        "actualRev": 218121.46,
        "revenue": 218121.46,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S35",
        "label": "Aave Base USDC (aBasUSDC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S36",
        "label": "Fluid Savings USDS (fsUSDS, Base)",
        "valueSom": 283.9,
        "valueEom": 283.9,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S37",
        "label": "Savings USDS / sUSDS proxy (Base — POL)",
        "valueSom": 74829605.8,
        "valueEom": 75079284.39,
        "periodInflow": 0,
        "actualRev": 249678.59,
        "revenue": 249678.59,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 19037.71
      },
      {
        "id": "S38",
        "label": "USDS raw (Base — POL)",
        "valueSom": 65170000,
        "valueEom": 65170000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S39",
        "label": "USDC raw (Base — ALM idle)",
        "valueSom": 4732058.26,
        "valueEom": 4979093.44,
        "periodInflow": 247035.17,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S41",
        "label": "Aave Arbitrum USDCn (aArbUSDCn)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S42",
        "label": "Fluid Savings USDS (fsUSDS, Arbitrum)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S43",
        "label": "Savings USDS / sUSDS proxy (Arbitrum — POL)",
        "valueSom": 178950.65,
        "valueEom": 196264917.55,
        "periodInflow": 195832690.84,
        "actualRev": 253276.06,
        "revenue": 253276.06,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 20938.88
      },
      {
        "id": "S44",
        "label": "USDS raw (Arbitrum — POL)",
        "valueSom": 90000000,
        "valueEom": 90000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S45",
        "label": "USDC raw (Arbitrum — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 4994817.32,
        "periodInflow": -5182.68,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S47",
        "label": "Savings USDS / sUSDS proxy (Optimism — POL)",
        "valueSom": 970178.13,
        "valueEom": 101106912.91,
        "periodInflow": 100004463.92,
        "actualRev": 132270.86,
        "revenue": 132270.86,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 10916.28
      },
      {
        "id": "S48",
        "label": "USDS raw (Optimism — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S49",
        "label": "USDC raw (Optimism — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 5000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S51",
        "label": "Savings USDS / sUSDS proxy (Unichain — POL)",
        "valueSom": 970178.13,
        "valueEom": 973415.25,
        "periodInflow": 0,
        "actualRev": 3237.12,
        "revenue": 3237.12,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 246.83
      },
      {
        "id": "S52",
        "label": "USDS raw (Unichain — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S53",
        "label": "USDC raw (Unichain — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 5000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S54",
        "label": "Aave Avalanche USDC (aAvaUSDC)",
        "valueSom": 10000438.06,
        "valueEom": 10000965.04,
        "periodInflow": -31069.97,
        "actualRev": 31596.95,
        "revenue": 31596.95,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S55",
        "label": "USDC raw (Avalanche-C — ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "127",
        "dr": 7581.55,
        "notes": "Synthetic code: untagged sUSDC"
      },
      {
        "refCode": "128",
        "dr": 1021651,
        "notes": ""
      },
      {
        "refCode": "129",
        "dr": 2.58,
        "notes": ""
      },
      {
        "refCode": "130",
        "dr": 2533.88,
        "notes": "Synthetic code: Untagged spUSDT."
      },
      {
        "refCode": "131",
        "dr": 284.57,
        "notes": "Synthetic code: Untagged spUSDC. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "132",
        "dr": 0,
        "notes": "Synthetic code: Untagged spPYUSD. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "170",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "171",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "182",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "183",
        "dr": 21333.38,
        "notes": ""
      },
      {
        "refCode": "186",
        "dr": 978.23,
        "notes": ""
      },
      {
        "refCode": "188",
        "dr": 1186.52,
        "notes": ""
      },
      {
        "refCode": "190",
        "dr": 10486.78,
        "notes": ""
      },
      {
        "refCode": "191",
        "dr": 3403.28,
        "notes": ""
      },
      {
        "refCode": "192",
        "dr": 56666.76,
        "notes": ""
      },
      {
        "refCode": "194",
        "dr": 4.96,
        "notes": ""
      },
      {
        "refCode": "195",
        "dr": 3879.94,
        "notes": ""
      },
      {
        "refCode": "196",
        "dr": 0.03,
        "notes": ""
      },
      {
        "refCode": "197",
        "dr": 6824.99,
        "notes": "stUSDS"
      },
      {
        "refCode": "198",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "200",
        "dr": 2.1,
        "notes": ""
      },
      {
        "refCode": "202",
        "dr": 30.39,
        "notes": ""
      },
      {
        "refCode": "204",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "205",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "206",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "214",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "216",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "219",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "223",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "224",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "303",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "555",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "9001",
        "dr": 17637.13,
        "notes": "Synthetic code: USDS in Aave aEthUSDS (0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259). No on-chain Referral event; entire contract balance attributed. XR rate."
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 2368433176.884962,
      "baseRate": 0.04312000189646037,
      "referenceRate": 0.0364,
      "referenceRateKind": "effr",
      "subsidisedRate": 0.0364,
      "effectiveRate": 0.040282682287005,
      "diffVsBaseBps": -28.37319609455365,
      "subsidyBenefit": 548975.5674283891,
      "cofAtFullBase": 8492478.697000314,
      "cofOnUtilized": 7822171.387061289,
      "skyDirectComponent": 2023.078108892489,
      "skyRevenueMax": 10677050.23587752,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "S21",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "USTB on Eth",
        "actualRevenue": 0,
        "sdRevenue": 0
      },
      {
        "id": "S24",
        "kind": "fixed",
        "cap": null,
        "start": "2025-11-13",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3 — Curve Pools",
        "label": "USDT in sUSDS/USDT Curve",
        "actualRevenue": 2023.078108892489,
        "sdRevenue": 2023.078108892489
      }
    ],
    "debtDaily": [
      {
        "date": "2026-01-01",
        "cumDebt": 3115938887,
        "utilized": 2382602735,
        "dailySkyCharge": 257880.99
      },
      {
        "date": "2026-01-02",
        "cumDebt": 3135982066,
        "utilized": 2406146321,
        "dailySkyCharge": 260604.22
      },
      {
        "date": "2026-01-03",
        "cumDebt": 3132345455,
        "utilized": 2405852867,
        "dailySkyCharge": 260570.28
      },
      {
        "date": "2026-01-04",
        "cumDebt": 3159565316,
        "utilized": 2426024815,
        "dailySkyCharge": 262903.52
      },
      {
        "date": "2026-01-05",
        "cumDebt": 3156192250,
        "utilized": 2455190637,
        "dailySkyCharge": 266277.06
      },
      {
        "date": "2026-01-06",
        "cumDebt": 3124600128,
        "utilized": 2390328086,
        "dailySkyCharge": 258774.57
      },
      {
        "date": "2026-01-07",
        "cumDebt": 3141267545,
        "utilized": 2412970897,
        "dailySkyCharge": 261393.61
      },
      {
        "date": "2026-01-08",
        "cumDebt": 3265561524,
        "utilized": 2500980229,
        "dailySkyCharge": 271573.43
      },
      {
        "date": "2026-01-09",
        "cumDebt": 3094864924,
        "utilized": 2328610395,
        "dailySkyCharge": 251635.83
      },
      {
        "date": "2026-01-10",
        "cumDebt": 3062061485,
        "utilized": 2294563884,
        "dailySkyCharge": 247697.75
      },
      {
        "date": "2026-01-11",
        "cumDebt": 3048008204,
        "utilized": 2280809702,
        "dailySkyCharge": 246106.84
      },
      {
        "date": "2026-01-12",
        "cumDebt": 3055540788,
        "utilized": 2276789885,
        "dailySkyCharge": 245641.88
      },
      {
        "date": "2026-01-13",
        "cumDebt": 2987427990,
        "utilized": 2207818179,
        "dailySkyCharge": 237664.09
      },
      {
        "date": "2026-01-14",
        "cumDebt": 2903838073,
        "utilized": 2177578242,
        "dailySkyCharge": 234166.31
      },
      {
        "date": "2026-01-15",
        "cumDebt": 2886685922,
        "utilized": 2141309922,
        "dailySkyCharge": 229971.24
      },
      {
        "date": "2026-01-16",
        "cumDebt": 2888675648,
        "utilized": 2137192388,
        "dailySkyCharge": 229494.97
      },
      {
        "date": "2026-01-17",
        "cumDebt": 2887645848,
        "utilized": 2139145245,
        "dailySkyCharge": 229720.86
      },
      {
        "date": "2026-01-18",
        "cumDebt": 2889707369,
        "utilized": 2142749521,
        "dailySkyCharge": 230137.75
      },
      {
        "date": "2026-01-19",
        "cumDebt": 3243246357,
        "utilized": 2490397319,
        "dailySkyCharge": 270349.33
      },
      {
        "date": "2026-01-20",
        "cumDebt": 3222620802,
        "utilized": 2471864955,
        "dailySkyCharge": 268205.74
      },
      {
        "date": "2026-01-21",
        "cumDebt": 3126710227,
        "utilized": 2378631592,
        "dailySkyCharge": 257421.66
      },
      {
        "date": "2026-01-22",
        "cumDebt": 3146456083,
        "utilized": 2383083193,
        "dailySkyCharge": 257936.57
      },
      {
        "date": "2026-01-23",
        "cumDebt": 3171100297,
        "utilized": 2394736708,
        "dailySkyCharge": 259284.5
      },
      {
        "date": "2026-01-24",
        "cumDebt": 3172623318,
        "utilized": 2395258448,
        "dailySkyCharge": 259344.85
      },
      {
        "date": "2026-01-25",
        "cumDebt": 3183140976,
        "utilized": 2407417618,
        "dailySkyCharge": 260751.27
      },
      {
        "date": "2026-01-26",
        "cumDebt": 3205334696,
        "utilized": 2429007867,
        "dailySkyCharge": 263248.56
      },
      {
        "date": "2026-01-27",
        "cumDebt": 3246510342,
        "utilized": 2451073788,
        "dailySkyCharge": 265800.88
      },
      {
        "date": "2026-01-28",
        "cumDebt": 3268984218,
        "utilized": 2462788174,
        "dailySkyCharge": 267155.85
      },
      {
        "date": "2026-01-29",
        "cumDebt": 3404188305,
        "utilized": 2574820031,
        "dailySkyCharge": 280114.3
      },
      {
        "date": "2026-01-30",
        "cumDebt": 3386327420,
        "utilized": 2555046495,
        "dailySkyCharge": 277827.15
      },
      {
        "date": "2026-01-31",
        "cumDebt": 3341062222,
        "utilized": 2520638343,
        "dailySkyCharge": 273847.24
      }
    ],
    "excludedVenues": [
      {
        "id": "S56",
        "label": "Spark Savings V2 — spUSDC vault",
        "valueSom": 215278739.04,
        "valueEom": 207131500.43
      },
      {
        "id": "S57",
        "label": "Spark Savings V2 — spUSDT vault",
        "valueSom": 153856441.43,
        "valueEom": 120038508.36
      },
      {
        "id": "S59",
        "label": "Spark Savings V2 — spPYUSD vault",
        "valueSom": 21463.34,
        "valueEom": 285387.14
      },
      {
        "id": "S60",
        "label": "Spark Savings V2 — spUSDC vault (Avalanche-C, CREATE2 same address)",
        "valueSom": 190414182.35,
        "valueEom": 95656876.18
      }
    ]
  },
  {
    "partner": "spark",
    "month": "2026-02",
    "periodDays": 28,
    "headline": {
      "agentRate": 114973.5,
      "distributionRewards": 1022253.36,
      "primeAgentNetRevenue": 2774130.72,
      "primeSideSkyDirectExposure": 30517.19,
      "primeAgentProfit": 3941874.76,
      "primeCostOfFunds": 7486766.17,
      "skySideSkyDirectExposure": 3733.88,
      "skyRevenue": 7490500.05
    },
    "venues": [
      {
        "id": "S1",
        "label": "Spark USDS (SparkLend spToken)",
        "valueSom": 556639355.91,
        "valueEom": 275418608.32,
        "periodInflow": -282473846.17,
        "actualRev": 1253098.57,
        "revenue": 1253098.57,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S2",
        "label": "Spark USDC (SparkLend spToken)",
        "valueSom": 43659321.09,
        "valueEom": 47958113.07,
        "periodInflow": 4194983.35,
        "actualRev": 103808.62,
        "revenue": 103808.62,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S3",
        "label": "Spark USDT (SparkLend spToken)",
        "valueSom": 220863532.36,
        "valueEom": 334974961.95,
        "periodInflow": 113698984.79,
        "actualRev": 412444.8,
        "revenue": 412444.8,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S4",
        "label": "Spark DAI (SparkLend spToken)",
        "valueSom": 305426388.32,
        "valueEom": 246097994.85,
        "periodInflow": -60046808.95,
        "actualRev": 718415.48,
        "revenue": 718415.48,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S5",
        "label": "Spark PYUSD (SparkLend spToken)",
        "valueSom": 99995755.66,
        "valueEom": 100000062.96,
        "periodInflow": -57005.69,
        "actualRev": 61312.99,
        "revenue": 61312.99,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S6",
        "label": "Aave Ethereum Lido USDS (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S7",
        "label": "Aave Ethereum USDS (aToken)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S8",
        "label": "Aave Ethereum USDC (aToken)",
        "valueSom": 0.06,
        "valueEom": 0.06,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S9",
        "label": "Aave Ethereum USDT (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S10",
        "label": "Spark Blue Chip USDC Vault (Morpho)",
        "valueSom": 976334.44,
        "valueEom": 977613.84,
        "periodInflow": -981.47,
        "actualRev": 2260.87,
        "revenue": 2260.87,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S11",
        "label": "Spark Blue Chip USDT Vault (Morpho V2)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S12",
        "label": "Spark DAI Vault (Morpho)",
        "valueSom": 332.92,
        "valueEom": 344.96,
        "periodInflow": 10.78,
        "actualRev": 1.26,
        "revenue": 1.26,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S13",
        "label": "Spark USDS Vault (Morpho)",
        "valueSom": 21.91,
        "valueEom": 21.91,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S14",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 100000608.93,
        "valueEom": 200002600.61,
        "periodInflow": 99419577.24,
        "actualRev": 582414.44,
        "revenue": 582414.44,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S15",
        "label": "Maple syrupUSDT (ERC-4626)",
        "valueSom": 0,
        "valueEom": 55000541.21,
        "periodInflow": 54898594.23,
        "actualRev": 101946.98,
        "revenue": 101946.98,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S16",
        "label": "Ethena Staked USDe (sUSDe)",
        "valueSom": 98.61,
        "valueEom": 98.88,
        "periodInflow": 0,
        "actualRev": 0.27,
        "revenue": 0.27,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S17",
        "label": "Fluid Savings USDS (fsUSDS)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S18",
        "label": "Arkis Spark Prime USDC 1 (ERC-4626)",
        "valueSom": 15106645.24,
        "valueEom": 10113369.18,
        "periodInflow": -5051740.21,
        "actualRev": 58464.16,
        "revenue": 58464.16,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S19",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S20",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S21",
        "label": "Superstate Short Duration US Government Securities Fund (USTB)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S22",
        "label": "Superstate Crypto Carry Fund (USCC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S23",
        "label": "Anchorage tri-party loan escrow (USDC pass-through, ~$0 balance)",
        "valueSom": 1.21,
        "valueEom": 1.21,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S24",
        "label": "Spark.fi USDT Reserve Curve (sUSDS/USDT)",
        "valueSom": 49999911.75,
        "valueEom": 50000340.65,
        "periodInflow": -33822.17,
        "actualRev": 3733.88,
        "revenue": 30517.19,
        "sdRevenue": 3733.88,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S25",
        "label": "Spark.fi PYUSD Reserve Curve (PYUSD/USDS)",
        "valueSom": 100000425.55,
        "valueEom": 100000617.74,
        "periodInflow": -12634.46,
        "actualRev": 12826.65,
        "revenue": 12826.65,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S26",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": -891780,
        "actualRev": 891780,
        "revenue": 891780,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S27",
        "label": "USDT raw (ALM idle — $442M as of 2026-04)",
        "valueSom": 0,
        "valueEom": 1868.74,
        "periodInflow": 1868.74,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S28",
        "label": "PYUSD raw (ALM idle — $677M as of 2026-04)",
        "valueSom": 524852622.17,
        "valueEom": 527588174.07,
        "periodInflow": -89448.1,
        "actualRev": 2825000,
        "revenue": 2825000,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S29",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S30",
        "label": "USDe raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S31",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S32",
        "label": "sUSDS raw / POL (ALM — Cat B 4626, demand-side spread)",
        "valueSom": 393521575.97,
        "valueEom": 798615399.44,
        "periodInflow": 403349712.2,
        "actualRev": 1138527.93,
        "revenue": 1138527.93,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S34",
        "label": "Spark USDC Vault (Morpho, Base)",
        "valueSom": 61.15,
        "valueEom": 494.72,
        "periodInflow": 432.35,
        "actualRev": 1.22,
        "revenue": 1.22,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S35",
        "label": "Aave Base USDC (aBasUSDC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S36",
        "label": "Fluid Savings USDS (fsUSDS, Base)",
        "valueSom": 283.9,
        "valueEom": 283.9,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S37",
        "label": "Savings USDS / sUSDS proxy (Base — POL)",
        "valueSom": 75079284.39,
        "valueEom": 75305516.52,
        "periodInflow": 0,
        "actualRev": 226232.13,
        "revenue": 226232.13,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 17252.72
      },
      {
        "id": "S38",
        "label": "USDS raw (Base — POL)",
        "valueSom": 65170000,
        "valueEom": 65170000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S39",
        "label": "USDC raw (Base — ALM idle)",
        "valueSom": 4979093.44,
        "valueEom": 5000000,
        "periodInflow": 20906.56,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S41",
        "label": "Aave Arbitrum USDCn (aArbUSDCn)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S42",
        "label": "Fluid Savings USDS (fsUSDS, Arbitrum)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S43",
        "label": "Savings USDS / sUSDS proxy (Arbitrum — POL)",
        "valueSom": 196264917.55,
        "valueEom": 196856311.43,
        "periodInflow": 0,
        "actualRev": 591393.88,
        "revenue": 591393.88,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 45100.39
      },
      {
        "id": "S44",
        "label": "USDS raw (Arbitrum — POL)",
        "valueSom": 90000000,
        "valueEom": 90000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S45",
        "label": "USDC raw (Arbitrum — ALM idle)",
        "valueSom": 4994817.32,
        "valueEom": 4983790.6,
        "periodInflow": -11026.72,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S47",
        "label": "Savings USDS / sUSDS proxy (Optimism — POL)",
        "valueSom": 101106912.91,
        "valueEom": 101411572.6,
        "periodInflow": 0,
        "actualRev": 304659.69,
        "revenue": 304659.69,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 23233.7
      },
      {
        "id": "S48",
        "label": "USDS raw (Optimism — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S49",
        "label": "USDC raw (Optimism — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 5000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S51",
        "label": "Savings USDS / sUSDS proxy (Unichain — POL)",
        "valueSom": 973415.25,
        "valueEom": 976348.39,
        "periodInflow": 0,
        "actualRev": 2933.14,
        "revenue": 2933.14,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 223.68
      },
      {
        "id": "S52",
        "label": "USDS raw (Unichain — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S53",
        "label": "USDC raw (Unichain — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 4997665.83,
        "periodInflow": -2334.17,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S54",
        "label": "Aave Avalanche USDC (aAvaUSDC)",
        "valueSom": 10000965.04,
        "valueEom": 10000143.51,
        "periodInflow": -20243.63,
        "actualRev": 19422.1,
        "revenue": 19422.1,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S55",
        "label": "USDC raw (Avalanche-C — ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "127",
        "dr": 6588.11,
        "notes": "Synthetic code: untagged sUSDC"
      },
      {
        "refCode": "128",
        "dr": 924737.42,
        "notes": ""
      },
      {
        "refCode": "129",
        "dr": 0.88,
        "notes": ""
      },
      {
        "refCode": "130",
        "dr": 801.17,
        "notes": "Synthetic code: Untagged spUSDT."
      },
      {
        "refCode": "131",
        "dr": 263.83,
        "notes": "Synthetic code: Untagged spUSDC. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "132",
        "dr": 0,
        "notes": "Synthetic code: Untagged spPYUSD. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "170",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "171",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "182",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "183",
        "dr": 13278.93,
        "notes": ""
      },
      {
        "refCode": "186",
        "dr": 1266.98,
        "notes": ""
      },
      {
        "refCode": "188",
        "dr": 270.21,
        "notes": ""
      },
      {
        "refCode": "190",
        "dr": 5343.6,
        "notes": ""
      },
      {
        "refCode": "191",
        "dr": 5540.8,
        "notes": ""
      },
      {
        "refCode": "192",
        "dr": 41751.2,
        "notes": ""
      },
      {
        "refCode": "194",
        "dr": 4.25,
        "notes": ""
      },
      {
        "refCode": "195",
        "dr": 1671.22,
        "notes": ""
      },
      {
        "refCode": "196",
        "dr": 0.22,
        "notes": ""
      },
      {
        "refCode": "197",
        "dr": 6314.15,
        "notes": "stUSDS"
      },
      {
        "refCode": "198",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "200",
        "dr": 0.73,
        "notes": ""
      },
      {
        "refCode": "202",
        "dr": 34.1,
        "notes": ""
      },
      {
        "refCode": "204",
        "dr": 4.01,
        "notes": ""
      },
      {
        "refCode": "205",
        "dr": 0.03,
        "notes": ""
      },
      {
        "refCode": "206",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "214",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "216",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "219",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "223",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "224",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "303",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "555",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "9001",
        "dr": 14381.46,
        "notes": "Synthetic code: USDS in Aave aEthUSDS (0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259). No on-chain Referral event; entire contract balance attributed. XR rate."
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 2508076304.951767,
      "baseRate": 0.04312000189646037,
      "referenceRate": 0.0364,
      "referenceRateKind": "effr",
      "subsidisedRate": 0.03668000007901918,
      "effectiveRate": 0.04055229619917895,
      "diffVsBaseBps": -25.6770569728142,
      "subsidyBenefit": 475124.5953942272,
      "cofAtFullBase": 8122887.021486939,
      "cofOnUtilized": 7486766.172836288,
      "skyDirectComponent": 3733.877754048192,
      "skyRevenueMax": 10052985.99596801,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "S21",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "USTB on Eth",
        "actualRevenue": 0,
        "sdRevenue": 0
      },
      {
        "id": "S24",
        "kind": "fixed",
        "cap": null,
        "start": "2025-11-13",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3 — Curve Pools",
        "label": "USDT in sUSDS/USDT Curve",
        "actualRevenue": 3733.877754048192,
        "sdRevenue": 3733.877754048192
      }
    ],
    "debtDaily": [
      {
        "date": "2026-02-01",
        "cumDebt": 3302687682,
        "utilized": 2496067660,
        "dailySkyCharge": 271745.36
      },
      {
        "date": "2026-02-02",
        "cumDebt": 3249848458,
        "utilized": 2456202150,
        "dailySkyCharge": 267134.21
      },
      {
        "date": "2026-02-03",
        "cumDebt": 3281812558,
        "utilized": 2487186681,
        "dailySkyCharge": 270718.12
      },
      {
        "date": "2026-02-04",
        "cumDebt": 3283598242,
        "utilized": 2492170041,
        "dailySkyCharge": 271294.53
      },
      {
        "date": "2026-02-05",
        "cumDebt": 3192373856,
        "utilized": 2417229955,
        "dailySkyCharge": 262626.4
      },
      {
        "date": "2026-02-06",
        "cumDebt": 3119581319,
        "utilized": 2386394304,
        "dailySkyCharge": 259059.71
      },
      {
        "date": "2026-02-07",
        "cumDebt": 3108659979,
        "utilized": 2385104097,
        "dailySkyCharge": 258910.48
      },
      {
        "date": "2026-02-08",
        "cumDebt": 3108645884,
        "utilized": 2396902998,
        "dailySkyCharge": 260275.23
      },
      {
        "date": "2026-02-09",
        "cumDebt": 3232676857,
        "utilized": 2509639458,
        "dailySkyCharge": 273315.18
      },
      {
        "date": "2026-02-10",
        "cumDebt": 3250373396,
        "utilized": 2526769549,
        "dailySkyCharge": 275296.57
      },
      {
        "date": "2026-02-11",
        "cumDebt": 3288028684,
        "utilized": 2551312466,
        "dailySkyCharge": 278135.39
      },
      {
        "date": "2026-02-12",
        "cumDebt": 3278949491,
        "utilized": 2556708606,
        "dailySkyCharge": 278759.55
      },
      {
        "date": "2026-02-13",
        "cumDebt": 3291015503,
        "utilized": 2576250439,
        "dailySkyCharge": 281019.91
      },
      {
        "date": "2026-02-14",
        "cumDebt": 3259420082,
        "utilized": 2536910610,
        "dailySkyCharge": 276469.57
      },
      {
        "date": "2026-02-15",
        "cumDebt": 3227911600,
        "utilized": 2508270588,
        "dailySkyCharge": 273156.84
      },
      {
        "date": "2026-02-16",
        "cumDebt": 3302094176,
        "utilized": 2588046393,
        "dailySkyCharge": 282384.32
      },
      {
        "date": "2026-02-17",
        "cumDebt": 3304200729,
        "utilized": 2575648515,
        "dailySkyCharge": 280950.29
      },
      {
        "date": "2026-02-18",
        "cumDebt": 3274922013,
        "utilized": 2546189949,
        "dailySkyCharge": 277542.89
      },
      {
        "date": "2026-02-19",
        "cumDebt": 3277769691,
        "utilized": 2512556553,
        "dailySkyCharge": 273652.59
      },
      {
        "date": "2026-02-20",
        "cumDebt": 3301747152,
        "utilized": 2536169077,
        "dailySkyCharge": 276383.8
      },
      {
        "date": "2026-02-21",
        "cumDebt": 3304161887,
        "utilized": 2549499918,
        "dailySkyCharge": 277925.74
      },
      {
        "date": "2026-02-22",
        "cumDebt": 3298183349,
        "utilized": 2544991385,
        "dailySkyCharge": 277404.25
      },
      {
        "date": "2026-02-23",
        "cumDebt": 3285993117,
        "utilized": 2522080595,
        "dailySkyCharge": 274754.21
      },
      {
        "date": "2026-02-24",
        "cumDebt": 3248053334,
        "utilized": 2504438391,
        "dailySkyCharge": 272713.58
      },
      {
        "date": "2026-02-25",
        "cumDebt": 3231815084,
        "utilized": 2505790416,
        "dailySkyCharge": 272869.97
      },
      {
        "date": "2026-02-26",
        "cumDebt": 3226591742,
        "utilized": 2503884835,
        "dailySkyCharge": 272649.56
      },
      {
        "date": "2026-02-27",
        "cumDebt": 3204137038,
        "utilized": 2472464754,
        "dailySkyCharge": 269015.27
      },
      {
        "date": "2026-02-28",
        "cumDebt": 3285160150,
        "utilized": 2581256157,
        "dailySkyCharge": 281598.91
      }
    ],
    "excludedVenues": [
      {
        "id": "S56",
        "label": "Spark Savings V2 — spUSDC vault",
        "valueSom": 207131500.43,
        "valueEom": 287780830.42
      },
      {
        "id": "S57",
        "label": "Spark Savings V2 — spUSDT vault",
        "valueSom": 120038508.36,
        "valueEom": 387977397.42
      },
      {
        "id": "S59",
        "label": "Spark Savings V2 — spPYUSD vault",
        "valueSom": 285387.14,
        "valueEom": 94443.72
      },
      {
        "id": "S60",
        "label": "Spark Savings V2 — spUSDC vault (Avalanche-C, CREATE2 same address)",
        "valueSom": 95656876.18,
        "valueEom": 152857139.2
      }
    ]
  },
  {
    "partner": "spark",
    "month": "2026-03",
    "periodDays": 31,
    "headline": {
      "agentRate": 122911.67,
      "distributionRewards": 1412270.82,
      "primeAgentNetRevenue": 2271278.33,
      "primeSideSkyDirectExposure": 77510.75,
      "primeAgentProfit": 3883971.58,
      "primeCostOfFunds": 7803415.92,
      "skySideSkyDirectExposure": 5964.76,
      "skyRevenue": 7809380.68
    },
    "venues": [
      {
        "id": "S1",
        "label": "Spark USDS (SparkLend spToken)",
        "valueSom": 275418608.32,
        "valueEom": 150752807.53,
        "periodInflow": -125270347.52,
        "actualRev": 604546.72,
        "revenue": 604546.72,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S2",
        "label": "Spark USDC (SparkLend spToken)",
        "valueSom": 47958113.07,
        "valueEom": 37220.76,
        "periodInflow": -47920892.31,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S3",
        "label": "Spark USDT (SparkLend spToken)",
        "valueSom": 334974961.95,
        "valueEom": 282411706.54,
        "periodInflow": -53138486.11,
        "actualRev": 575230.7,
        "revenue": 575230.7,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S4",
        "label": "Spark DAI (SparkLend spToken)",
        "valueSom": 246097994.85,
        "valueEom": 252839704.15,
        "periodInflow": 6171379.73,
        "actualRev": 570329.57,
        "revenue": 570329.57,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S5",
        "label": "Spark PYUSD (SparkLend spToken)",
        "valueSom": 100000062.96,
        "valueEom": 100000230.67,
        "periodInflow": -71291.74,
        "actualRev": 71459.45,
        "revenue": 71459.45,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S6",
        "label": "Aave Ethereum Lido USDS (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S7",
        "label": "Aave Ethereum USDS (aToken)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S8",
        "label": "Aave Ethereum USDC (aToken)",
        "valueSom": 0.06,
        "valueEom": 0.06,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S9",
        "label": "Aave Ethereum USDT (aToken)",
        "valueSom": 0,
        "valueEom": 495610843.87,
        "periodInflow": 495610843.87,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S10",
        "label": "Spark Blue Chip USDC Vault (Morpho)",
        "valueSom": 977613.84,
        "valueEom": 977119.89,
        "periodInflow": -5343.44,
        "actualRev": 4849.5,
        "revenue": 4849.5,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S11",
        "label": "Spark Blue Chip USDT Vault (Morpho V2)",
        "valueSom": 0,
        "valueEom": 40001.5,
        "periodInflow": 39998.02,
        "actualRev": 3.48,
        "revenue": 3.48,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S12",
        "label": "Spark DAI Vault (Morpho)",
        "valueSom": 344.96,
        "valueEom": 359.99,
        "periodInflow": 14.07,
        "actualRev": 0.95,
        "revenue": 0.95,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S13",
        "label": "Spark USDS Vault (Morpho)",
        "valueSom": 21.91,
        "valueEom": 21.91,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S14",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 200002600.61,
        "valueEom": 100002159.26,
        "periodInflow": -100415536.35,
        "actualRev": 415095.01,
        "revenue": 415095.01,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S15",
        "label": "Maple syrupUSDT (ERC-4626)",
        "valueSom": 55000541.21,
        "valueEom": 100001961.58,
        "periodInflow": 44829017.3,
        "actualRev": 172403.07,
        "revenue": 172403.07,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S16",
        "label": "Ethena Staked USDe (sUSDe)",
        "valueSom": 98.88,
        "valueEom": 99.17,
        "periodInflow": 0,
        "actualRev": 0.29,
        "revenue": 0.29,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S17",
        "label": "Fluid Savings USDS (fsUSDS)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S18",
        "label": "Arkis Spark Prime USDC 1 (ERC-4626)",
        "valueSom": 10113369.18,
        "valueEom": 10156910.09,
        "periodInflow": 0,
        "actualRev": 43540.91,
        "revenue": 43540.91,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S19",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S20",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S21",
        "label": "Superstate Short Duration US Government Securities Fund (USTB)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S22",
        "label": "Superstate Crypto Carry Fund (USCC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S23",
        "label": "Anchorage tri-party loan escrow (USDC pass-through, ~$0 balance)",
        "valueSom": 1.21,
        "valueEom": 133501.21,
        "periodInflow": 0,
        "actualRev": 133500,
        "revenue": 133500,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S24",
        "label": "Spark.fi USDT Reserve Curve (sUSDS/USDT)",
        "valueSom": 50000340.65,
        "valueEom": 50000879.86,
        "periodInflow": -82936.31,
        "actualRev": 5964.76,
        "revenue": 77510.75,
        "sdRevenue": 5964.76,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S25",
        "label": "Spark.fi PYUSD Reserve Curve (PYUSD/USDS)",
        "valueSom": 100000617.74,
        "valueEom": 100000454.45,
        "periodInflow": -9546.01,
        "actualRev": 9382.72,
        "revenue": 9382.72,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S26",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": -805479,
        "actualRev": 805479,
        "revenue": 805479,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S27",
        "label": "USDT raw (ALM idle — $442M as of 2026-04)",
        "valueSom": 1868.74,
        "valueEom": 0,
        "periodInflow": -1868.74,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S28",
        "label": "PYUSD raw (ALM idle — $677M as of 2026-04)",
        "valueSom": 527588174.07,
        "valueEom": 555394863.22,
        "periodInflow": 25146870.15,
        "actualRev": 2659819,
        "revenue": 2659819,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S29",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S30",
        "label": "USDe raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S31",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S32",
        "label": "sUSDS raw / POL (ALM — Cat B 4626, demand-side spread)",
        "valueSom": 798615399.44,
        "valueEom": 1371348954.66,
        "periodInflow": 569734360.09,
        "actualRev": 1802372.7,
        "revenue": 1802372.7,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S34",
        "label": "Spark USDC Vault (Morpho, Base)",
        "valueSom": 494.72,
        "valueEom": 427.9,
        "periodInflow": -68.11,
        "actualRev": 1.29,
        "revenue": 1.29,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S35",
        "label": "Aave Base USDC (aBasUSDC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S36",
        "label": "Fluid Savings USDS (fsUSDS, Base)",
        "valueSom": 283.9,
        "valueEom": 283.9,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S37",
        "label": "Savings USDS / sUSDS proxy (Base — POL)",
        "valueSom": 75305516.52,
        "valueEom": 75545660.91,
        "periodInflow": 0,
        "actualRev": 240144.39,
        "revenue": 240144.39,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 19158.79
      },
      {
        "id": "S38",
        "label": "USDS raw (Base — POL)",
        "valueSom": 65170000,
        "valueEom": 65170000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S39",
        "label": "USDC raw (Base — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 4997775.72,
        "periodInflow": -2224.28,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S41",
        "label": "Aave Arbitrum USDCn (aArbUSDCn)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S42",
        "label": "Fluid Savings USDS (fsUSDS, Arbitrum)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S43",
        "label": "Savings USDS / sUSDS proxy (Arbitrum — POL)",
        "valueSom": 196856311.43,
        "valueEom": 142898719.72,
        "periodInflow": -54446929.8,
        "actualRev": 489338.09,
        "revenue": 489338.09,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 38465.16
      },
      {
        "id": "S44",
        "label": "USDS raw (Arbitrum — POL)",
        "valueSom": 90000000,
        "valueEom": 90000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S45",
        "label": "USDC raw (Arbitrum — ALM idle)",
        "valueSom": 4983790.6,
        "valueEom": 4442753.64,
        "periodInflow": -541036.96,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S47",
        "label": "Savings USDS / sUSDS proxy (Optimism — POL)",
        "valueSom": 101411572.6,
        "valueEom": 101734967.51,
        "periodInflow": 0,
        "actualRev": 323394.91,
        "revenue": 323394.91,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 25800.54
      },
      {
        "id": "S48",
        "label": "USDS raw (Optimism — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S49",
        "label": "USDC raw (Optimism — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 5000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S51",
        "label": "Savings USDS / sUSDS proxy (Unichain — POL)",
        "valueSom": 976348.39,
        "valueEom": 979461.9,
        "periodInflow": 0,
        "actualRev": 3113.51,
        "revenue": 3113.51,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 248.4
      },
      {
        "id": "S52",
        "label": "USDS raw (Unichain — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S53",
        "label": "USDC raw (Unichain — ALM idle)",
        "valueSom": 4997665.83,
        "valueEom": 4987120.65,
        "periodInflow": -10545.18,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S54",
        "label": "Aave Avalanche USDC (aAvaUSDC)",
        "valueSom": 10000143.51,
        "valueEom": 10000122.64,
        "periodInflow": -19331.28,
        "actualRev": 19310.41,
        "revenue": 19310.41,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S55",
        "label": "USDC raw (Avalanche-C — ALM idle)",
        "valueSom": 0,
        "valueEom": 10.26,
        "periodInflow": 10.26,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "127",
        "dr": 5410.52,
        "notes": "Synthetic code: untagged sUSDC"
      },
      {
        "refCode": "128",
        "dr": 1278806.71,
        "notes": ""
      },
      {
        "refCode": "129",
        "dr": 0.91,
        "notes": ""
      },
      {
        "refCode": "130",
        "dr": 4314.49,
        "notes": "Synthetic code: Untagged spUSDT."
      },
      {
        "refCode": "131",
        "dr": 6315.99,
        "notes": "Synthetic code: Untagged spUSDC. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "132",
        "dr": 0.01,
        "notes": "Synthetic code: Untagged spPYUSD. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "170",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "171",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "182",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "183",
        "dr": 11113.76,
        "notes": ""
      },
      {
        "refCode": "186",
        "dr": 2578.98,
        "notes": ""
      },
      {
        "refCode": "188",
        "dr": 9419.73,
        "notes": ""
      },
      {
        "refCode": "190",
        "dr": 4238.45,
        "notes": ""
      },
      {
        "refCode": "191",
        "dr": 8706.61,
        "notes": ""
      },
      {
        "refCode": "192",
        "dr": 48284.11,
        "notes": ""
      },
      {
        "refCode": "194",
        "dr": 4.7,
        "notes": ""
      },
      {
        "refCode": "195",
        "dr": 7613.54,
        "notes": ""
      },
      {
        "refCode": "196",
        "dr": 0.25,
        "notes": ""
      },
      {
        "refCode": "197",
        "dr": 5576.07,
        "notes": "stUSDS"
      },
      {
        "refCode": "198",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "200",
        "dr": 5.88,
        "notes": ""
      },
      {
        "refCode": "202",
        "dr": 43.57,
        "notes": ""
      },
      {
        "refCode": "204",
        "dr": 37.6,
        "notes": ""
      },
      {
        "refCode": "205",
        "dr": 0.2,
        "notes": ""
      },
      {
        "refCode": "206",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "214",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "216",
        "dr": 216.61,
        "notes": ""
      },
      {
        "refCode": "219",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "223",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "224",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "303",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "555",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "9001",
        "dr": 19582.08,
        "notes": "Synthetic code: USDS in Aave aEthUSDS (0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259). No on-chain Referral event; entire contract balance attributed. XR rate."
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 2431714480.2962,
      "baseRate": 0.04124672584310142,
      "referenceRate": 0.0364,
      "referenceRateKind": "effr",
      "subsidisedRate": 0.03680496665912168,
      "effectiveRate": 0.03941483592081255,
      "diffVsBaseBps": -18.31889922288867,
      "subsidyBenefit": 364118.1373055246,
      "cofAtFullBase": 8348004.6733626,
      "cofOnUtilized": 7803415.915572274,
      "skyDirectComponent": 5964.764912320331,
      "skyRevenueMax": 10311501.09741878,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "S21",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "USTB on Eth",
        "actualRevenue": 0,
        "sdRevenue": 0
      },
      {
        "id": "S24",
        "kind": "fixed",
        "cap": null,
        "start": "2025-11-13",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3 — Curve Pools",
        "label": "USDT in sUSDS/USDT Curve",
        "actualRevenue": 5964.764912320331,
        "sdRevenue": 5964.764912320331
      }
    ],
    "debtDaily": [
      {
        "date": "2026-03-01",
        "cumDebt": 3273186628,
        "utilized": 2558447691,
        "dailySkyCharge": 279700.66
      },
      {
        "date": "2026-03-02",
        "cumDebt": 3312905815,
        "utilized": 2586120863,
        "dailySkyCharge": 282901.55
      },
      {
        "date": "2026-03-03",
        "cumDebt": 3288887996,
        "utilized": 2573061894,
        "dailySkyCharge": 281391.05
      },
      {
        "date": "2026-03-04",
        "cumDebt": 3011872451,
        "utilized": 2346160284,
        "dailySkyCharge": 255145.89
      },
      {
        "date": "2026-03-05",
        "cumDebt": 2934280135,
        "utilized": 2279081752,
        "dailySkyCharge": 247387.08
      },
      {
        "date": "2026-03-06",
        "cumDebt": 2906827861,
        "utilized": 2242230249,
        "dailySkyCharge": 243124.56
      },
      {
        "date": "2026-03-07",
        "cumDebt": 2914418248,
        "utilized": 2244371035,
        "dailySkyCharge": 243372.18
      },
      {
        "date": "2026-03-08",
        "cumDebt": 2905906207,
        "utilized": 2237207854,
        "dailySkyCharge": 242543.63
      },
      {
        "date": "2026-03-09",
        "cumDebt": 2919330609,
        "utilized": 2262837774,
        "dailySkyCharge": 236628.15
      },
      {
        "date": "2026-03-10",
        "cumDebt": 2919474828,
        "utilized": 2265355654,
        "dailySkyCharge": 236902.78
      },
      {
        "date": "2026-03-11",
        "cumDebt": 2916473180,
        "utilized": 2274956306,
        "dailySkyCharge": 237949.95
      },
      {
        "date": "2026-03-12",
        "cumDebt": 2913930590,
        "utilized": 2257345895,
        "dailySkyCharge": 236029.13
      },
      {
        "date": "2026-03-13",
        "cumDebt": 2917733578,
        "utilized": 2270954161,
        "dailySkyCharge": 237513.43
      },
      {
        "date": "2026-03-14",
        "cumDebt": 2929909749,
        "utilized": 2280232864,
        "dailySkyCharge": 238525.48
      },
      {
        "date": "2026-03-15",
        "cumDebt": 2936670767,
        "utilized": 2287358585,
        "dailySkyCharge": 239302.71
      },
      {
        "date": "2026-03-16",
        "cumDebt": 2947615952,
        "utilized": 2297837825,
        "dailySkyCharge": 240445.71
      },
      {
        "date": "2026-03-17",
        "cumDebt": 2948695927,
        "utilized": 2298952454,
        "dailySkyCharge": 240567.28
      },
      {
        "date": "2026-03-18",
        "cumDebt": 3038847826,
        "utilized": 2390700623,
        "dailySkyCharge": 250574.53
      },
      {
        "date": "2026-03-19",
        "cumDebt": 3037076208,
        "utilized": 2379149136,
        "dailySkyCharge": 249314.58
      },
      {
        "date": "2026-03-20",
        "cumDebt": 3046238423,
        "utilized": 2355227244,
        "dailySkyCharge": 246705.35
      },
      {
        "date": "2026-03-21",
        "cumDebt": 3216973841,
        "utilized": 2517373473,
        "dailySkyCharge": 264391.13
      },
      {
        "date": "2026-03-22",
        "cumDebt": 3279778241,
        "utilized": 2592515143,
        "dailySkyCharge": 272587.06
      },
      {
        "date": "2026-03-23",
        "cumDebt": 3274409364,
        "utilized": 2590435765,
        "dailySkyCharge": 272360.25
      },
      {
        "date": "2026-03-24",
        "cumDebt": 3258286523,
        "utilized": 2568367775,
        "dailySkyCharge": 269953.23
      },
      {
        "date": "2026-03-25",
        "cumDebt": 3240036014,
        "utilized": 2553872400,
        "dailySkyCharge": 268372.18
      },
      {
        "date": "2026-03-26",
        "cumDebt": 3258786403,
        "utilized": 2566729739,
        "dailySkyCharge": 269774.56
      },
      {
        "date": "2026-03-27",
        "cumDebt": 3254345729,
        "utilized": 2561124087,
        "dailySkyCharge": 269163.14
      },
      {
        "date": "2026-03-28",
        "cumDebt": 3239162204,
        "utilized": 2544949855,
        "dailySkyCharge": 267398.97
      },
      {
        "date": "2026-03-29",
        "cumDebt": 3389012173,
        "utilized": 2693383176,
        "dailySkyCharge": 283589.04
      },
      {
        "date": "2026-03-30",
        "cumDebt": 3425594357,
        "utilized": 2706579712,
        "dailySkyCharge": 285028.42
      },
      {
        "date": "2026-03-31",
        "cumDebt": 3535027761,
        "utilized": 2800227621,
        "dailySkyCharge": 295242.89
      }
    ],
    "excludedVenues": [
      {
        "id": "S56",
        "label": "Spark Savings V2 — spUSDC vault",
        "valueSom": 287780830.42,
        "valueEom": 456780102.34
      },
      {
        "id": "S57",
        "label": "Spark Savings V2 — spUSDT vault",
        "valueSom": 387977397.42,
        "valueEom": 867900893.34
      },
      {
        "id": "S59",
        "label": "Spark Savings V2 — spPYUSD vault",
        "valueSom": 94443.72,
        "valueEom": 504861.56
      },
      {
        "id": "S60",
        "label": "Spark Savings V2 — spUSDC vault (Avalanche-C, CREATE2 same address)",
        "valueSom": 152857139.2,
        "valueEom": 73619968.24
      }
    ]
  },
  {
    "partner": "spark",
    "month": "2026-04",
    "periodDays": 30,
    "headline": {
      "agentRate": 115391.31,
      "distributionRewards": 1506065.38,
      "primeAgentNetRevenue": 730223.45,
      "primeSideSkyDirectExposure": 103204.22,
      "primeAgentProfit": 2454884.35,
      "primeCostOfFunds": 9253073.28,
      "skySideSkyDirectExposure": 12598.46,
      "skyRevenue": 9265671.73
    },
    "venues": [
      {
        "id": "S1",
        "label": "Spark USDS (SparkLend spToken)",
        "valueSom": 150752807.53,
        "valueEom": 147862782.13,
        "periodInflow": -3204237.19,
        "actualRev": 314211.8,
        "revenue": 314211.8,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S2",
        "label": "Spark USDC (SparkLend spToken)",
        "valueSom": 37220.76,
        "valueEom": 9229822.11,
        "periodInflow": 9192475.97,
        "actualRev": 125.38,
        "revenue": 125.38,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S3",
        "label": "Spark USDT (SparkLend spToken)",
        "valueSom": 282411706.54,
        "valueEom": 677669071.17,
        "periodInflow": 394679852.5,
        "actualRev": 577512.14,
        "revenue": 577512.14,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S4",
        "label": "Spark DAI (SparkLend spToken)",
        "valueSom": 252839704.15,
        "valueEom": 266184835.47,
        "periodInflow": 12792019.28,
        "actualRev": 553112.04,
        "revenue": 553112.04,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S5",
        "label": "Spark PYUSD (SparkLend spToken)",
        "valueSom": 100000230.67,
        "valueEom": 100001095.92,
        "periodInflow": -45420.23,
        "actualRev": 46285.48,
        "revenue": 46285.48,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S6",
        "label": "Aave Ethereum Lido USDS (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S7",
        "label": "Aave Ethereum USDS (aToken)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S8",
        "label": "Aave Ethereum USDC (aToken)",
        "valueSom": 0.06,
        "valueEom": 0.06,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S9",
        "label": "Aave Ethereum USDT (aToken)",
        "valueSom": 495610843.87,
        "valueEom": 5.9,
        "periodInflow": -495610837.97,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S10",
        "label": "Spark Blue Chip USDC Vault (Morpho)",
        "valueSom": 977119.89,
        "valueEom": 704090.8,
        "periodInflow": -282575.51,
        "actualRev": 9546.42,
        "revenue": 9546.42,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S11",
        "label": "Spark Blue Chip USDT Vault (Morpho V2)",
        "valueSom": 40001.5,
        "valueEom": 51710579.95,
        "periodInflow": 51501761.81,
        "actualRev": 168816.64,
        "revenue": 168816.64,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S12",
        "label": "Spark DAI Vault (Morpho)",
        "valueSom": 359.99,
        "valueEom": 458.57,
        "periodInflow": 84.46,
        "actualRev": 14.13,
        "revenue": 14.13,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S13",
        "label": "Spark USDS Vault (Morpho)",
        "valueSom": 21.91,
        "valueEom": 21.91,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S14",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 100002159.26,
        "valueEom": 105306162.11,
        "periodInflow": 5131267.42,
        "actualRev": 172735.43,
        "revenue": 172735.43,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S15",
        "label": "Maple syrupUSDT (ERC-4626)",
        "valueSom": 100001961.58,
        "valueEom": 76904851.99,
        "periodInflow": -23301896.56,
        "actualRev": 204786.96,
        "revenue": 204786.96,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S16",
        "label": "Ethena Staked USDe (sUSDe)",
        "valueSom": 99.17,
        "valueEom": 99.5,
        "periodInflow": 0,
        "actualRev": 0.33,
        "revenue": 0.33,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S17",
        "label": "Fluid Savings USDS (fsUSDS)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S18",
        "label": "Arkis Spark Prime USDC 1 (ERC-4626)",
        "valueSom": 10156910.09,
        "valueEom": 0.28,
        "periodInflow": -10175195.99,
        "actualRev": 18286.18,
        "revenue": 18286.18,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S19",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S20",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S21",
        "label": "Superstate Short Duration US Government Securities Fund (USTB)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S22",
        "label": "Superstate Crypto Carry Fund (USCC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S23",
        "label": "Anchorage tri-party loan escrow (USDC pass-through, ~$0 balance)",
        "valueSom": 133501.21,
        "valueEom": 1.55,
        "periodInflow": 0,
        "actualRev": -133499.67,
        "revenue": -133499.67,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S24",
        "label": "Spark.fi USDT Reserve Curve (sUSDS/USDT)",
        "valueSom": 50000879.86,
        "valueEom": 50002415.26,
        "periodInflow": -114267.27,
        "actualRev": 12598.46,
        "revenue": 103204.22,
        "sdRevenue": 12598.46,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S25",
        "label": "Spark.fi PYUSD Reserve Curve (PYUSD/USDS)",
        "valueSom": 100000454.45,
        "valueEom": 99998676.75,
        "periodInflow": -11346.7,
        "actualRev": 9569.01,
        "revenue": 9569.01,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S26",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S27",
        "label": "USDT raw (ALM idle — $442M as of 2026-04)",
        "valueSom": 0,
        "valueEom": 483436565.92,
        "periodInflow": 483436565.92,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S28",
        "label": "PYUSD raw (ALM idle — $677M as of 2026-04)",
        "valueSom": 555394863.22,
        "valueEom": 677151123.08,
        "periodInflow": 118579884.86,
        "actualRev": 3176375,
        "revenue": 3176375,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S29",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S30",
        "label": "USDe raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S31",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S32",
        "label": "sUSDS raw / POL (ALM — Cat B 4626, demand-side spread)",
        "valueSom": 1371348954.66,
        "valueEom": 1723240793.74,
        "periodInflow": 347828250.48,
        "actualRev": 2780948.05,
        "revenue": 2780948.05,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S34",
        "label": "Spark USDC Vault (Morpho, Base)",
        "valueSom": 427.9,
        "valueEom": 224.72,
        "periodInflow": -4700.61,
        "actualRev": 4497.43,
        "revenue": 4497.43,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S35",
        "label": "Aave Base USDC (aBasUSDC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S36",
        "label": "Fluid Savings USDS (fsUSDS, Base)",
        "valueSom": 283.9,
        "valueEom": 283.9,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S37",
        "label": "Savings USDS / sUSDS proxy (Base — POL)",
        "valueSom": 75545660.91,
        "valueEom": 75772907.26,
        "periodInflow": 0,
        "actualRev": 227246.35,
        "revenue": 227246.35,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 18599.89
      },
      {
        "id": "S38",
        "label": "USDS raw (Base — POL)",
        "valueSom": 65170000,
        "valueEom": 65170000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S39",
        "label": "USDC raw (Base — ALM idle)",
        "valueSom": 4997775.72,
        "valueEom": 5000000,
        "periodInflow": 2224.28,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S41",
        "label": "Aave Arbitrum USDCn (aArbUSDCn)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S42",
        "label": "Fluid Savings USDS (fsUSDS, Arbitrum)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S43",
        "label": "Savings USDS / sUSDS proxy (Arbitrum — POL)",
        "valueSom": 142898719.72,
        "valueEom": 143328568.53,
        "periodInflow": 0,
        "actualRev": 429848.81,
        "revenue": 429848.81,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 35182.7
      },
      {
        "id": "S44",
        "label": "USDS raw (Arbitrum — POL)",
        "valueSom": 90000000,
        "valueEom": 90000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S45",
        "label": "USDC raw (Arbitrum — ALM idle)",
        "valueSom": 4442753.64,
        "valueEom": 5009602.26,
        "periodInflow": 566848.62,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S47",
        "label": "Savings USDS / sUSDS proxy (Optimism — POL)",
        "valueSom": 101734967.51,
        "valueEom": 102040993.03,
        "periodInflow": 0,
        "actualRev": 306025.52,
        "revenue": 306025.52,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 25047.88
      },
      {
        "id": "S48",
        "label": "USDS raw (Optimism — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S49",
        "label": "USDC raw (Optimism — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 5000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S51",
        "label": "Savings USDS / sUSDS proxy (Unichain — POL)",
        "valueSom": 979461.9,
        "valueEom": 982408.19,
        "periodInflow": 0,
        "actualRev": 2946.29,
        "revenue": 2946.29,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 241.15
      },
      {
        "id": "S52",
        "label": "USDS raw (Unichain — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S53",
        "label": "USDC raw (Unichain — ALM idle)",
        "valueSom": 4987120.65,
        "valueEom": 4996314.28,
        "periodInflow": 9193.64,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S54",
        "label": "Aave Avalanche USDC (aAvaUSDC)",
        "valueSom": 10000122.64,
        "valueEom": 0.15,
        "periodInflow": -10000122.48,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S55",
        "label": "USDC raw (Avalanche-C — ALM idle)",
        "valueSom": 10.26,
        "valueEom": 2500.22,
        "periodInflow": 2489.96,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "127",
        "dr": 3613.36,
        "notes": "Synthetic code: untagged sUSDC"
      },
      {
        "refCode": "128",
        "dr": 1378577.04,
        "notes": ""
      },
      {
        "refCode": "129",
        "dr": 0.89,
        "notes": ""
      },
      {
        "refCode": "130",
        "dr": 4674.33,
        "notes": "Synthetic code: Untagged spUSDT."
      },
      {
        "refCode": "131",
        "dr": 4736.49,
        "notes": "Synthetic code: Untagged spUSDC. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "132",
        "dr": 0.01,
        "notes": "Synthetic code: Untagged spPYUSD. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "170",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "171",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "182",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "183",
        "dr": 9912.97,
        "notes": ""
      },
      {
        "refCode": "186",
        "dr": 2215.1,
        "notes": ""
      },
      {
        "refCode": "188",
        "dr": 18355.46,
        "notes": ""
      },
      {
        "refCode": "190",
        "dr": 2928.64,
        "notes": ""
      },
      {
        "refCode": "191",
        "dr": 13631.82,
        "notes": ""
      },
      {
        "refCode": "192",
        "dr": 37688.17,
        "notes": ""
      },
      {
        "refCode": "194",
        "dr": 4.3,
        "notes": ""
      },
      {
        "refCode": "195",
        "dr": 4968.32,
        "notes": ""
      },
      {
        "refCode": "196",
        "dr": 0.25,
        "notes": ""
      },
      {
        "refCode": "197",
        "dr": 8508.93,
        "notes": "stUSDS"
      },
      {
        "refCode": "198",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "200",
        "dr": 32.6,
        "notes": ""
      },
      {
        "refCode": "202",
        "dr": 40.21,
        "notes": ""
      },
      {
        "refCode": "204",
        "dr": 78.15,
        "notes": ""
      },
      {
        "refCode": "205",
        "dr": 0.21,
        "notes": ""
      },
      {
        "refCode": "206",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "214",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "216",
        "dr": 377.45,
        "notes": ""
      },
      {
        "refCode": "219",
        "dr": 14.26,
        "notes": ""
      },
      {
        "refCode": "223",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "224",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "303",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "555",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "9001",
        "dr": 15706.36,
        "notes": "Synthetic code: USDS in Aave aEthUSDS (0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259). No on-chain Referral event; entire contract balance attributed. XR rate."
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 2988806180.523181,
      "baseRate": 0.04028621767610686,
      "referenceRate": 0.0364,
      "referenceRateKind": "effr",
      "subsidisedRate": 0.03688895040288687,
      "effectiveRate": 0.0391410605085019,
      "diffVsBaseBps": -11.45157167604957,
      "subsidyBenefit": 270879.1830035028,
      "cofAtFullBase": 9702873.433050597,
      "cofOnUtilized": 9253073.27698445,
      "skyDirectComponent": 12598.4555305973,
      "skyRevenueMax": 11700495.65151448,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "S21",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "USTB on Eth",
        "actualRevenue": 0,
        "sdRevenue": 0
      },
      {
        "id": "S24",
        "kind": "fixed",
        "cap": null,
        "start": "2025-11-13",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3 — Curve Pools",
        "label": "USDT in sUSDS/USDT Curve",
        "actualRevenue": 12598.4555305973,
        "sdRevenue": 12598.4555305973
      }
    ],
    "debtDaily": [
      {
        "date": "2026-04-01",
        "cumDebt": 3523339474,
        "utilized": 2784292547,
        "dailySkyCharge": 293968.64
      },
      {
        "date": "2026-04-02",
        "cumDebt": 3592034561,
        "utilized": 2867657513,
        "dailySkyCharge": 303061.51
      },
      {
        "date": "2026-04-03",
        "cumDebt": 3594620732,
        "utilized": 2875295501,
        "dailySkyCharge": 303894.61
      },
      {
        "date": "2026-04-04",
        "cumDebt": 3599360796,
        "utilized": 2872629206,
        "dailySkyCharge": 303603.79
      },
      {
        "date": "2026-04-05",
        "cumDebt": 3608169214,
        "utilized": 2879664844,
        "dailySkyCharge": 304371.18
      },
      {
        "date": "2026-04-06",
        "cumDebt": 3601926982,
        "utilized": 2914905338,
        "dailySkyCharge": 308214.97
      },
      {
        "date": "2026-04-07",
        "cumDebt": 3614158391,
        "utilized": 2902686749,
        "dailySkyCharge": 306882.25
      },
      {
        "date": "2026-04-08",
        "cumDebt": 3589322105,
        "utilized": 2907586309,
        "dailySkyCharge": 307416.66
      },
      {
        "date": "2026-04-09",
        "cumDebt": 3588932378,
        "utilized": 2905392368,
        "dailySkyCharge": 307177.36
      },
      {
        "date": "2026-04-10",
        "cumDebt": 3582212364,
        "utilized": 2905301386,
        "dailySkyCharge": 307167.44
      },
      {
        "date": "2026-04-11",
        "cumDebt": 3573973229,
        "utilized": 2898585065,
        "dailySkyCharge": 306434.87
      },
      {
        "date": "2026-04-12",
        "cumDebt": 3645135456,
        "utilized": 2971139956,
        "dailySkyCharge": 314348.65
      },
      {
        "date": "2026-04-13",
        "cumDebt": 3459834185,
        "utilized": 2789291999,
        "dailySkyCharge": 294513.94
      },
      {
        "date": "2026-04-14",
        "cumDebt": 3460915790,
        "utilized": 2792630539,
        "dailySkyCharge": 294878.09
      },
      {
        "date": "2026-04-15",
        "cumDebt": 3472674145,
        "utilized": 2803977278,
        "dailySkyCharge": 296115.71
      },
      {
        "date": "2026-04-16",
        "cumDebt": 3470267236,
        "utilized": 2799846208,
        "dailySkyCharge": 295665.12
      },
      {
        "date": "2026-04-17",
        "cumDebt": 3466901125,
        "utilized": 2798188841,
        "dailySkyCharge": 295484.35
      },
      {
        "date": "2026-04-18",
        "cumDebt": 3493187733,
        "utilized": 2823871285,
        "dailySkyCharge": 298285.61
      },
      {
        "date": "2026-04-19",
        "cumDebt": 3541095952,
        "utilized": 2876150994,
        "dailySkyCharge": 303987.92
      },
      {
        "date": "2026-04-20",
        "cumDebt": 3681926266,
        "utilized": 2990808988,
        "dailySkyCharge": 316494.01
      },
      {
        "date": "2026-04-21",
        "cumDebt": 3859033303,
        "utilized": 3135663170,
        "dailySkyCharge": 332293.7
      },
      {
        "date": "2026-04-22",
        "cumDebt": 3965038750,
        "utilized": 3211729936,
        "dailySkyCharge": 334415.25
      },
      {
        "date": "2026-04-23",
        "cumDebt": 3988315738,
        "utilized": 3292539380,
        "dailySkyCharge": 343015.86
      },
      {
        "date": "2026-04-24",
        "cumDebt": 3997485459,
        "utilized": 3297029907,
        "dailySkyCharge": 343493.79
      },
      {
        "date": "2026-04-25",
        "cumDebt": 3970400950,
        "utilized": 3276806846,
        "dailySkyCharge": 341341.43
      },
      {
        "date": "2026-04-26",
        "cumDebt": 4020838179,
        "utilized": 3312690633,
        "dailySkyCharge": 345160.57
      },
      {
        "date": "2026-04-27",
        "cumDebt": 3951593612,
        "utilized": 3258562512,
        "dailySkyCharge": 339399.68
      },
      {
        "date": "2026-04-28",
        "cumDebt": 4078988518,
        "utilized": 3362562387,
        "dailySkyCharge": 350468.46
      },
      {
        "date": "2026-04-29",
        "cumDebt": 3518789604,
        "utilized": 2779633695,
        "dailySkyCharge": 288426.91
      },
      {
        "date": "2026-04-30",
        "cumDebt": 4107490252,
        "utilized": 3377064033,
        "dailySkyCharge": 352011.88
      }
    ],
    "excludedVenues": [
      {
        "id": "S56",
        "label": "Spark Savings V2 — spUSDC vault",
        "valueSom": 456780102.34,
        "valueEom": 573332157.53
      },
      {
        "id": "S57",
        "label": "Spark Savings V2 — spUSDT vault",
        "valueSom": 867900893.34,
        "valueEom": 1134703231.02
      },
      {
        "id": "S59",
        "label": "Spark Savings V2 — spPYUSD vault",
        "valueSom": 504861.56,
        "valueEom": 1066559.88
      },
      {
        "id": "S60",
        "label": "Spark Savings V2 — spUSDC vault (Avalanche-C, CREATE2 same address)",
        "valueSom": 73619968.24,
        "valueEom": 37138817.43
      }
    ]
  },
  {
    "partner": "spark",
    "month": "2026-05",
    "periodDays": 31,
    "headline": {
      "agentRate": 118578.18,
      "distributionRewards": 1632540.8,
      "primeAgentNetRevenue": 2732761.23,
      "primeSideSkyDirectExposure": 33605.38,
      "primeAgentProfit": 4517485.59,
      "primeCostOfFunds": 10642578.13,
      "skySideSkyDirectExposure": 40550.68,
      "skyRevenue": 10683128.82
    },
    "venues": [
      {
        "id": "S1",
        "label": "Spark USDS (SparkLend spToken)",
        "valueSom": 147862782.13,
        "valueEom": 550178045.36,
        "periodInflow": 402021171.71,
        "actualRev": 294091.52,
        "revenue": 294091.52,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S2",
        "label": "Spark USDC (SparkLend spToken)",
        "valueSom": 9229822.11,
        "valueEom": 12183497.21,
        "periodInflow": 2921172.2,
        "actualRev": 32502.9,
        "revenue": 32502.9,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S3",
        "label": "Spark USDT (SparkLend spToken)",
        "valueSom": 677669071.17,
        "valueEom": 495837665.42,
        "periodInflow": -183699517.92,
        "actualRev": 1868112.17,
        "revenue": 1868112.17,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S4",
        "label": "Spark DAI (SparkLend spToken)",
        "valueSom": 266184835.47,
        "valueEom": 266960907.71,
        "periodInflow": 216619.3,
        "actualRev": 559452.94,
        "revenue": 559452.94,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S5",
        "label": "Spark PYUSD (SparkLend spToken)",
        "valueSom": 100001095.92,
        "valueEom": 100000628.58,
        "periodInflow": -29471.31,
        "actualRev": 29003.97,
        "revenue": 29003.97,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S6",
        "label": "Aave Ethereum Lido USDS (aToken)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S7",
        "label": "Aave Ethereum USDS (aToken)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S8",
        "label": "Aave Ethereum USDC (aToken)",
        "valueSom": 0.06,
        "valueEom": 0.06,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S9",
        "label": "Aave Ethereum USDT (aToken)",
        "valueSom": 5.9,
        "valueEom": 5.91,
        "periodInflow": 0,
        "actualRev": 0.02,
        "revenue": 0.02,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S10",
        "label": "Spark Blue Chip USDC Vault (Morpho)",
        "valueSom": 704090.8,
        "valueEom": 3501087.14,
        "periodInflow": 2792191.45,
        "actualRev": 4804.89,
        "revenue": 4804.89,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S11",
        "label": "Spark Blue Chip USDT Vault (Morpho V2)",
        "valueSom": 51710579.95,
        "valueEom": 71943502.1,
        "periodInflow": 20015652.75,
        "actualRev": 217269.4,
        "revenue": 217269.4,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S12",
        "label": "Spark DAI Vault (Morpho)",
        "valueSom": 458.57,
        "valueEom": 539.87,
        "periodInflow": 4.97,
        "actualRev": 76.33,
        "revenue": 76.33,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S13",
        "label": "Spark USDS Vault (Morpho)",
        "valueSom": 21.91,
        "valueEom": 21.91,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S14",
        "label": "Maple syrupUSDC (ERC-4626)",
        "valueSom": 105306162.11,
        "valueEom": 105300451.25,
        "periodInflow": -429241.46,
        "actualRev": 423530.61,
        "revenue": 423530.61,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S15",
        "label": "Maple syrupUSDT (ERC-4626)",
        "valueSom": 76904851.99,
        "valueEom": 0,
        "periodInflow": -77024493.61,
        "actualRev": 119641.62,
        "revenue": 119641.62,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S16",
        "label": "Ethena Staked USDe (sUSDe)",
        "valueSom": 99.5,
        "valueEom": 99.81,
        "periodInflow": 0,
        "actualRev": 0.31,
        "revenue": 0.31,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S17",
        "label": "Fluid Savings USDS (fsUSDS)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S18",
        "label": "Arkis Spark Prime USDC 1 (ERC-4626)",
        "valueSom": 0.28,
        "valueEom": 15021342.65,
        "periodInflow": 14999640.9,
        "actualRev": 21701.47,
        "revenue": 21701.47,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S19",
        "label": "BlackRock USD Institutional Digital Liquidity Fund (BUIDL-I)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S20",
        "label": "Janus Henderson Anemoy Treasury Fund (JTRSY)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S21",
        "label": "Superstate Short Duration US Government Securities Fund (USTB)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S22",
        "label": "Superstate Crypto Carry Fund (USCC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S23",
        "label": "Anchorage tri-party loan escrow (USDC pass-through, ~$0 balance)",
        "valueSom": 1.55,
        "valueEom": 10.02,
        "periodInflow": 0,
        "actualRev": 8.47,
        "revenue": 8.47,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S24",
        "label": "Spark.fi USDT Reserve Curve (sUSDS/USDT)",
        "valueSom": 50002415.26,
        "valueEom": 48750265.65,
        "periodInflow": -1326305.67,
        "actualRev": 40550.68,
        "revenue": 33605.38,
        "sdRevenue": 40550.68,
        "sdShare": 1,
        "spreadReimb": 0
      },
      {
        "id": "S25",
        "label": "Spark.fi PYUSD Reserve Curve (PYUSD/USDS)",
        "valueSom": 99998676.75,
        "valueEom": 99999260.91,
        "periodInflow": -5801.73,
        "actualRev": 6385.88,
        "revenue": 6385.88,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S26",
        "label": "USDC raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": -891780.28,
        "actualRev": 891780.28,
        "revenue": 891780.28,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S27",
        "label": "USDT raw (ALM idle — $442M as of 2026-04)",
        "valueSom": 483436565.92,
        "valueEom": 608678684.52,
        "periodInflow": 125436563.04,
        "actualRev": -194444.44,
        "revenue": -194444.44,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S28",
        "label": "PYUSD raw (ALM idle — $677M as of 2026-04)",
        "valueSom": 677151123.08,
        "valueEom": 262428227.92,
        "periodInflow": -417814475.16,
        "actualRev": 3091580,
        "revenue": 3091580,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S29",
        "label": "DAI raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S30",
        "label": "USDe raw (ALM idle)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S31",
        "label": "USDS raw / POL (ALM idle — already netted out of utilized)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S32",
        "label": "sUSDS raw / POL (ALM — Cat B 4626, demand-side spread)",
        "valueSom": 1723240793.74,
        "valueEom": 1577554266.46,
        "periodInflow": -151541864.9,
        "actualRev": 3834450.91,
        "revenue": 3834450.91,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S34",
        "label": "Spark USDC Vault (Morpho, Base)",
        "valueSom": 224.72,
        "valueEom": 424.91,
        "periodInflow": 199.03,
        "actualRev": 1.16,
        "revenue": 1.16,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S35",
        "label": "Aave Base USDC (aBasUSDC)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S36",
        "label": "Fluid Savings USDS (fsUSDS, Base)",
        "valueSom": 283.9,
        "valueEom": 283.9,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S37",
        "label": "Savings USDS / sUSDS proxy (Base — POL)",
        "valueSom": 75772907.26,
        "valueEom": 76003428.3,
        "periodInflow": 0,
        "actualRev": 230521.03,
        "revenue": 230521.03,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 19277.7
      },
      {
        "id": "S38",
        "label": "USDS raw (Base — POL)",
        "valueSom": 65170000,
        "valueEom": 65170000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S39",
        "label": "USDC raw (Base — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 4997576.71,
        "periodInflow": -2423.29,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S41",
        "label": "Aave Arbitrum USDCn (aArbUSDCn)",
        "valueSom": 0.01,
        "valueEom": 0.01,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S42",
        "label": "Fluid Savings USDS (fsUSDS, Arbitrum)",
        "valueSom": 0,
        "valueEom": 0,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S43",
        "label": "Savings USDS / sUSDS proxy (Arbitrum — POL)",
        "valueSom": 143328568.53,
        "valueEom": 143764611.58,
        "periodInflow": 0,
        "actualRev": 436043.05,
        "revenue": 436043.05,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 36464.81
      },
      {
        "id": "S44",
        "label": "USDS raw (Arbitrum — POL)",
        "valueSom": 90000000,
        "valueEom": 90000000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S45",
        "label": "USDC raw (Arbitrum — ALM idle)",
        "valueSom": 5009602.26,
        "valueEom": 4975417.17,
        "periodInflow": -34185.1,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S47",
        "label": "Savings USDS / sUSDS proxy (Optimism — POL)",
        "valueSom": 102040993.03,
        "valueEom": 102351428.46,
        "periodInflow": 0,
        "actualRev": 310435.43,
        "revenue": 310435.43,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 25960.67
      },
      {
        "id": "S48",
        "label": "USDS raw (Optimism — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S49",
        "label": "USDC raw (Optimism — ALM idle)",
        "valueSom": 5000000,
        "valueEom": 5019997.4,
        "periodInflow": 19997.4,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S51",
        "label": "Savings USDS / sUSDS proxy (Unichain — POL)",
        "valueSom": 982408.19,
        "valueEom": 985396.93,
        "periodInflow": 0,
        "actualRev": 2988.74,
        "revenue": 2988.74,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 249.94
      },
      {
        "id": "S52",
        "label": "USDS raw (Unichain — POL)",
        "valueSom": 89900000,
        "valueEom": 89900000,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S53",
        "label": "USDC raw (Unichain — ALM idle)",
        "valueSom": 4996314.28,
        "valueEom": 4992819.46,
        "periodInflow": -3494.82,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S54",
        "label": "Aave Avalanche USDC (aAvaUSDC)",
        "valueSom": 0.15,
        "valueEom": 0.16,
        "periodInflow": 0,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      },
      {
        "id": "S55",
        "label": "USDC raw (Avalanche-C — ALM idle)",
        "valueSom": 2500.22,
        "valueEom": 0,
        "periodInflow": -2500.22,
        "actualRev": 0,
        "revenue": 0,
        "sdRevenue": 0,
        "sdShare": 0,
        "spreadReimb": 0
      }
    ],
    "refCodes": [
      {
        "refCode": "2",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "127",
        "dr": 1824.59,
        "notes": "Synthetic code: untagged sUSDC"
      },
      {
        "refCode": "128",
        "dr": 1513777.28,
        "notes": ""
      },
      {
        "refCode": "129",
        "dr": 1.49,
        "notes": ""
      },
      {
        "refCode": "130",
        "dr": 3911.67,
        "notes": "Synthetic code: Untagged spUSDT."
      },
      {
        "refCode": "131",
        "dr": 4041.57,
        "notes": "Synthetic code: Untagged spUSDC. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "132",
        "dr": 0,
        "notes": "Synthetic code: Untagged spPYUSD. Combined into 128 by Spark on Dune."
      },
      {
        "refCode": "170",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "171",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "182",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "183",
        "dr": 11847.6,
        "notes": ""
      },
      {
        "refCode": "186",
        "dr": 1539.58,
        "notes": ""
      },
      {
        "refCode": "188",
        "dr": 12248.54,
        "notes": ""
      },
      {
        "refCode": "190",
        "dr": 2741.77,
        "notes": ""
      },
      {
        "refCode": "191",
        "dr": 25505.94,
        "notes": ""
      },
      {
        "refCode": "192",
        "dr": 26401.2,
        "notes": ""
      },
      {
        "refCode": "194",
        "dr": 4.38,
        "notes": ""
      },
      {
        "refCode": "195",
        "dr": 3082.91,
        "notes": ""
      },
      {
        "refCode": "196",
        "dr": 0.25,
        "notes": ""
      },
      {
        "refCode": "197",
        "dr": 10729.88,
        "notes": "stUSDS"
      },
      {
        "refCode": "198",
        "dr": 0.02,
        "notes": ""
      },
      {
        "refCode": "200",
        "dr": 91.6,
        "notes": ""
      },
      {
        "refCode": "202",
        "dr": 33.63,
        "notes": ""
      },
      {
        "refCode": "204",
        "dr": 75.98,
        "notes": ""
      },
      {
        "refCode": "205",
        "dr": 0.21,
        "notes": ""
      },
      {
        "refCode": "206",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "214",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "216",
        "dr": 471.89,
        "notes": ""
      },
      {
        "refCode": "219",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "223",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "224",
        "dr": 4582.17,
        "notes": ""
      },
      {
        "refCode": "303",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "555",
        "dr": 0,
        "notes": ""
      },
      {
        "refCode": "9001",
        "dr": 9626.62,
        "notes": "Synthetic code: USDS in Aave aEthUSDS (0x32a6268f9Ba3642Dda7892aDd74f1D34469A4259). No on-chain Referral event; entire contract balance attributed. XR rate."
      }
    ],
    "rateBuild": {
      "timeWeightedUtilized": 3356195943.673027,
      "baseRate": 0.03951513515348828,
      "referenceRate": 0.03628709677419355,
      "referenceRateKind": "effr",
      "subsidisedRate": 0.03682465368903005,
      "effectiveRate": 0.03871429258669792,
      "diffVsBaseBps": -8.008425667903683,
      "subsidyBenefit": 219906.399780756,
      "cofAtFullBase": 11047394.95315541,
      "cofOnUtilized": 10642578.13467968,
      "skyDirectComponent": 40550.6842112442,
      "skyRevenueMax": 13391864.98596525,
      "subsidyEnabled": true,
      "capUsd": 1000000000
    },
    "skyDirect": [
      {
        "id": "S21",
        "kind": "fixed",
        "cap": null,
        "start": "2025-10-30",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.1 — Treasury Bills",
        "label": "USTB on Eth",
        "actualRevenue": 0,
        "sdRevenue": 0
      },
      {
        "id": "S24",
        "kind": "fixed",
        "cap": null,
        "start": "2025-11-13",
        "end": "—",
        "active": true,
        "source": "Atlas A.2.2.9.1.1.1.1.3 — Curve Pools",
        "label": "USDT in sUSDS/USDT Curve",
        "actualRevenue": 40550.6842112442,
        "sdRevenue": 40550.6842112442
      }
    ],
    "debtDaily": [
      {
        "date": "2026-05-01",
        "cumDebt": 3958458569,
        "utilized": 3236279210,
        "dailySkyCharge": 337381.44
      },
      {
        "date": "2026-05-02",
        "cumDebt": 4299991855,
        "utilized": 3583341169,
        "dailySkyCharge": 374319.51
      },
      {
        "date": "2026-05-03",
        "cumDebt": 4298834263,
        "utilized": 3577229601,
        "dailySkyCharge": 373669.05
      },
      {
        "date": "2026-05-04",
        "cumDebt": 4196280374,
        "utilized": 3482111304,
        "dailySkyCharge": 363545.54
      },
      {
        "date": "2026-05-05",
        "cumDebt": 4147309492,
        "utilized": 3438062923,
        "dailySkyCharge": 358857.43
      },
      {
        "date": "2026-05-06",
        "cumDebt": 3944623107,
        "utilized": 3232022985,
        "dailySkyCharge": 336928.44
      },
      {
        "date": "2026-05-07",
        "cumDebt": 4003164482,
        "utilized": 3296854356,
        "dailySkyCharge": 343828.5
      },
      {
        "date": "2026-05-08",
        "cumDebt": 3253518029,
        "utilized": 2564167970,
        "dailySkyCharge": 265848.12
      },
      {
        "date": "2026-05-09",
        "cumDebt": 4037137793,
        "utilized": 3333245761,
        "dailySkyCharge": 347701.66
      },
      {
        "date": "2026-05-10",
        "cumDebt": 4189458831,
        "utilized": 3477336062,
        "dailySkyCharge": 363037.3
      },
      {
        "date": "2026-05-11",
        "cumDebt": 4122737535,
        "utilized": 3378762870,
        "dailySkyCharge": 352325.87
      },
      {
        "date": "2026-05-12",
        "cumDebt": 4044417082,
        "utilized": 3316629457,
        "dailySkyCharge": 345712.97
      },
      {
        "date": "2026-05-13",
        "cumDebt": 4045316487,
        "utilized": 3307806011,
        "dailySkyCharge": 344773.88
      },
      {
        "date": "2026-05-14",
        "cumDebt": 4083774000,
        "utilized": 3342721848,
        "dailySkyCharge": 348490
      },
      {
        "date": "2026-05-15",
        "cumDebt": 4119878244,
        "utilized": 3374734736,
        "dailySkyCharge": 351897.16
      },
      {
        "date": "2026-05-16",
        "cumDebt": 4128929378,
        "utilized": 3372689033,
        "dailySkyCharge": 351679.43
      },
      {
        "date": "2026-05-17",
        "cumDebt": 4108070523,
        "utilized": 3351939631,
        "dailySkyCharge": 349471.06
      },
      {
        "date": "2026-05-18",
        "cumDebt": 4315695725,
        "utilized": 3507020843,
        "dailySkyCharge": 365756.24
      },
      {
        "date": "2026-05-19",
        "cumDebt": 4285090896,
        "utilized": 3463785946,
        "dailySkyCharge": 361154.72
      },
      {
        "date": "2026-05-20",
        "cumDebt": 4023672828,
        "utilized": 3205941603,
        "dailySkyCharge": 333712.15
      },
      {
        "date": "2026-05-21",
        "cumDebt": 3968099737,
        "utilized": 3124170852,
        "dailySkyCharge": 325009.22
      },
      {
        "date": "2026-05-22",
        "cumDebt": 4470289889,
        "utilized": 3633642090,
        "dailySkyCharge": 379232.64
      },
      {
        "date": "2026-05-23",
        "cumDebt": 4453588584,
        "utilized": 3613109775,
        "dailySkyCharge": 377047.37
      },
      {
        "date": "2026-05-24",
        "cumDebt": 4472121918,
        "utilized": 3628217355,
        "dailySkyCharge": 378655.28
      },
      {
        "date": "2026-05-25",
        "cumDebt": 4469681753,
        "utilized": 3622578869,
        "dailySkyCharge": 378055.17
      },
      {
        "date": "2026-05-26",
        "cumDebt": 4201169449,
        "utilized": 3413429322,
        "dailySkyCharge": 352383.58
      },
      {
        "date": "2026-05-27",
        "cumDebt": 4071079397,
        "utilized": 3252967950,
        "dailySkyCharge": 335517.69
      },
      {
        "date": "2026-05-28",
        "cumDebt": 4081722021,
        "utilized": 3221477559,
        "dailySkyCharge": 332207.78
      },
      {
        "date": "2026-05-29",
        "cumDebt": 4160793859,
        "utilized": 3246872718,
        "dailySkyCharge": 334877.03
      },
      {
        "date": "2026-05-30",
        "cumDebt": 4128972374,
        "utilized": 3224509479,
        "dailySkyCharge": 332526.46
      },
      {
        "date": "2026-05-31",
        "cumDebt": 4116892425,
        "utilized": 3218414967,
        "dailySkyCharge": 331885.87
      }
    ],
    "excludedVenues": [
      {
        "id": "S56",
        "label": "Spark Savings V2 — spUSDC vault",
        "valueSom": 573332157.53,
        "valueEom": 303545287.19
      },
      {
        "id": "S57",
        "label": "Spark Savings V2 — spUSDT vault",
        "valueSom": 1134703231.02,
        "valueEom": 1270360913.25
      },
      {
        "id": "S59",
        "label": "Spark Savings V2 — spPYUSD vault",
        "valueSom": 1066559.88,
        "valueEom": 773533.78
      },
      {
        "id": "S60",
        "label": "Spark Savings V2 — spUSDC vault (Avalanche-C, CREATE2 same address)",
        "valueSom": 37138817.43,
        "valueEom": 25647247.42
      }
    ]
  }
];
