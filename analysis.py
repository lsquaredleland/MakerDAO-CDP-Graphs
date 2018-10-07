import pandas as pd
import requests

cdps = pd.DataFrame(requests.get("https://mkr.tools/api/cdps").json())
cdp_actions = pd.DataFrame(requests.get("https://mkr.tools/api/cdp/actions").json())
blocks = pd.DataFrame(requests.get("https://mkr.tools/api/blocks").json())
prices_mkr = pd.DataFrame(requests.get("https://mkr.tools/api/prices/mkr").json())
prices_eth = pd.DataFrame(requests.get("https://mkr.tools/api/prices/eth").json())


def collateralization_ratio(ink, eth_price, peth_eth, art):
    return ink * eth_price * peth_eth / art * 100

cup768 = cdps[cdps.cupi == 768]
actions768 = cdp_actions[cdp_actions.cupi == 768]


# Find the price of ETH right before the cdp actions
def getPriceBeforeTime(time):
    return prices_eth[prices_eth['time'] < time].iloc[-1]['price']

actions768['price'] = actions768['time'].apply(getPriceBeforeTime)


# Determine the art / ink at each step
# This is difficult to do with python apply...
actions768['art'] = 0
actions768['ink'] = 0


def setArtAndInk(row):
    if row['action'] == 'lock':  # adding PETH
        row['ink'] += row['param']
        # Need to do this and apply to all rows after
    if row['action'] == 'wipe':  # reducing debt with DAI
        row['art'] -= row['param']
    if row['action'] == 'draw':  # removing DAI
        row['art'] += row['param']
    if row['action'] == 'free':  # removing PETH
        row['ink'] -= row['param']
    if row['action'] == 'open':
        return
    if row['action'] == 'bite':  # unsure of what to do here
        return

actions768.apply(setArtAndInk, axis=1)
actions768
