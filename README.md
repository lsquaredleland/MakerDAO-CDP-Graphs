# ETH SF Hackathon

# What to do
- visualing if price of eth changes, how many CDPs would be under water?
- DEBT ceiling over time?

# Tool for?
What is the story that we want to tell to people? What is the problem in the system are there not enough people creating CDPs or are the creators afraid of massive macro events that are occuring to the system?

- CDP investors
	- look at the cost basis for set up + initial update, optimal behaviour for adding money?
	- tool to look at risks of having leverage
	- tool for determining what CDPs to buy? buying CDP vs trying to get it when it liquidates
	- determine what action to take, and how your position compares to other people (collateralisation, etc)
	- determine how much DAI / PETH can remove given price changes
- makerdao to help manage risk
	- what would happen if parameters changed
	- if price drops by x, how many CDPs would be underwater
	- analysis on the network level
	- how much more DAI can be issued
	- how much PETH can be reduced
	= how could the system be more capital efficient?
- governance, see how varying network parameters will change risk

## URLS
Seems that scraping these urls is the way to go rather than using MakerDAO's APIs
- https://mkr.tools/api/cdps
- https://mkr.tools/api/cdp/actions
- https://mkr.tools/api/blocks
- https://mkr.tools/api/prices/mkr
- https://mkr.tools/api/prices/eth

- Note must use query API --> can use this part for real time data
- Will mostly use historical data for analysis


# Terminology
- *Lock* You use this to add more collateral to your CDP. You can only add pooled eth (PETH) to a CDP as collateral. Generally, you do this when you open a CDP or when the price of eth drops and you are below your personal collateral threshold or your CDP is approaching liquidation. You can see that high black bars in the graph are on days that eth decreased in value.. people were adding more PETH to their CDPs to avoid liquidation.
- *Wipe* Use this to pay down your loan. You would "Wipe" debt that you previously took using the "Draw" function. In the maker world, this is kind of the equivalent to making your monthly mortgage payment (without the high interest rate!). Since Draw gives you Dai, you Wipe with Dai.
- *Draw* Use this feature to take loans in Dai from your CDP. Your ratio will go lower and liquidation price will go higher as you draw Dai.
- *Free* Take out PETH (your loan collateral) from your CDP that you added to your loan with the Lock command. Like Draw, this will make your loan more risky.
- *Open* Create your CDP. It opens with no collateral. You need to Lock collateral in after you call this command. Then you can make loans (Draw).
- *Bite* Liquidate a vulnerable CDP. Some good discussion here.


- *Lock* up collateral into a CDP
- *Wipe* out your debt with some DAI
- *Draw* out some DAI from your CDP
- *Free* up your collateral from the CDP
- *Open* a new CDP
- *Bite* up some under-collateralized CDPs

# Lots of terms
- *% Tot (PETH)*: Ratio of collateral PETH to total outstanding PETH
- *% Ratio*: Collateral ratio of the CDP
- *Account*: User’s active ethereum account
- *Avail. Dai (to draw)*: Maximum Dai that can currently be drawn from a CDP
- *Avail. PETH (to free)*: Maximum PETH that can currently be released from a CDP
- *Bite*: Initiate liquidation of an undercollateralized CDP
- *Boom*: Buy DAI with PETH
- *Bust*: Buy PETH with DAI
- *CDP Fee*: CDP interest rate
- *Collateral Auction*: The auction selling collateral in a liquidated CDP. It is designed to prioritize covering the debt owed by the CDP, then to give the owner the best price possible for their collateral refund
- *Collateralized Debt Position (CDP)*: A smart contract whose users receive an asset (Dai), which effectively operates as a debt instrument with an interest rate. The CDP user has posted collateral in excess of the value of the loan in order to guarantee their debt position
- *Collateral Ratio*: Ratio of the value of a CDP’s collateral to the value of its debt
- *Debt Ceiling*: Maximum number of DAI that can be issued
- *Debt (Dai)*: Amount of outstanding DAI debt in a CDP
- *Deficit*: Whether the system is at less than 100% overall collateralisation
- *Draw*: Create Dai against a CDP
- *ETH*: Ethereum
- *ETH/USD*: Price of 1 ETH in USD (as determined by the median of the feeds)
- *Exit*: Exchange PETH for ETH
- *Free*: Remove collateral from a CDP
- *Give*: Transfer CDP ownership
- *Join*: Exchange ETH for PETH
- *Keepers*: Independent economic actors that trade Dai, CDPs and/or MKR, create Dai or close CDPs and seek arbitrage opportunities in The Dai Stablecoin System and as a result help maintain Dai market rationality and price stability
- *Liq. Penalty*: Penalty charged by the system upon liquidation, as a percentage of the CDP collateral
- *Liq. Ratio*: Collateralization ratio below which a CDP may be liquidated
- *Liquidation price*: ETH price at which a CDP will become unsafe and at risk of liquidation
- *Lock*: Add collateral to a CDP
- *Locked (PETH)*: Amount of PETH collateral in a CDP
- *Oracles*: Ethereum accounts (contracts or users) selected to provide price feeds into various components of The Dai & Dai Stablecoin System
- *Open*: Open a new CDP
- *Pending Sale (DAI)*: Amount of surplus DAI pending sale via boom
- *Pending Sale (PETH)*: Amount of PETH collateral pending liquidation via bust
- *Redeemable*: Amount of ETH available to cash for DAI
- *Risk Parameters*: The stability fee, liquidation ratio, boom/bust gap, and debt ceiling
- *Safe*: Whether the overall collateralization of the system is above the liquidation ratio
- *DAI Target Rate*: Annual % change of Dai target price in USD. This represents Dai deflation or inflation when positive or negative, respectively
- *DAI/USD*: Target price for 1 DAI in USD
- *PETH*: The token used as collateral in CDPs which represents a claim on the ETH collateral pool of the Dai Stablecoin System
- *PETH/ETH*: Amount of collateral pool ETH claimed by 1 PETH
- *Shut*: Close a CDP - Wipe all debt, Free all collateral, and delete the CDP
- *Spread (boom/bust)*: Discount/premium relative to Dai target price at which the system buys/sells collateral PETH for DAI. When negative, collateral is being sold at a discount (under ‘bust’) and bought at a premium (under ‘boom’)
- *Spread (join/exit)*: Discount/premium for converting between ETH and PETH via join and exit; the profits are accrued to the PETH collateral pool
- *Status*: Whether the CDP is safe, unsafe (vulnerable to liquidation), or closed
- *Tap*: Liquidator
- *Top*: System overview / settlement
- *Total Locked*: Amount of PETH locked as collateral in CDPs
- *Total Pooled*: Amount of ETH in the PETH collateral pool
- *Tub*: CDP engine
- *Wipe*: Use Dai to cancel CDP debt
- *Wrap/Unwrap ETH*: Convert Ethereum into an ERC-20 compatible token

type Cup {
  *act*: Act!            # Most recent cup action
  *art*: BigFloat!       # Outstanding debt DAI
  *block*: Int!          # Block at most recent action
  *deleted*: Boolean!    # True if the cup has been shut
  *id*: Int!             # Unique Cup Id
  *ink*: BigFloat!       # Collateral PETH
  *ire*: BigFloat!       # Collateral less fee
  *lad*: String!         # Cup owner
  *pip*: BigFloat!       # Current USD/ETH price
  *ratio*: BigFloat      # Current collateralisation ratio
  *tab*: BigFloat        # Collateral USD
  *time*: Datetime!      # Timestamp of most recent action
  *actions*: [CupAct!]   # Cup actions
}

type CupAct {
  *act*: Act!            # Action name
  *arg*: String!         # Action argument
  *art*: BigFloat!       # Debt DAI at block
  *block*: Int!          # Block number
  *deleted*: Boolean!    # True if the cup has been shut
  *id*: Int!             # Cup Id
  *ink*: BigFloat!       # Collateral PETH at block
  *lad*: String!         # Cup owner
  *pip*: BigFloat!       # USD/ETH price at block
  *ratio*: BigFloat      # Collateralisation ratio at block
  *tab*: BigFloat        # Collateral USD at block
  *time*: Datetime!      # Block timestamp
  *tx*: String           # Transaction hash
}


Stability Debt * (Liquidation Ratio) / (Collateral * PETH/ETH Ratio) = Liquidation Price
(Locked PETH × ETH Price × PETH/ETH Ratio) ÷ Stability Debt × 100 = Collateralization Ratio


The value of one ETH is 350USD
The total staked PETH is 12
The ratio of PETH/ETH is 1.012
The Liquidation Ratio is 150%
The Stability Debt is 1000 DAI (DAI in circulation)

Find collateralization rate at every operation step before and after it occured

## More Interesting Questions
- Who is funding CDPs, where is the money orignating form
- Look at the people who are creating CDPs rather than CDPs by themselves
- Who are the ones market making (keepers), how many are there how do they interact...

What is the distribution in size of CDPs? and make this relative to time
- Make a CDP analysis tool in a graph form + compare to others
