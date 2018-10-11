from boa.interop.System.Runtime import CheckWitness
from boa.interop.System.Storage import GetContext, Get, Put


def Main(operation, args):
    if operation == "init":
        account = args[0]
        account2 = args[1]
        return Init(account, account2)

    if operation == "getBalance":
        account = args[0]
        return GetBalance(account)

    if operation == "transfer":
        fr = args[0]
        to = args[1]
        value = args[2]
        return Transfer(fr, to, value)

    return False


def GetBalance(account):
    context = GetContext()
    balance = Get(context, account)

    if balance == None:
        return False

    return balance


def Init(account, account2):
    context = GetContext()
    Put(context, account, 10000)
    Put(context, account2, 0)
    Notify(["transfer", "", account, 10000])
    return True


def Transfer(fr, to, value):
    if fr == None:
        return False

    if to == None:
        return False

    if value == None:
        return False

    context = GetContext()
    fromBalance = Get(context, fr)
    toBalance = Get(context, to)

    Put(context, to, toBalance + value)
    Put(context, fr, fromBalance - value)

    Notify(["transfer", fr, to, value])

    return True
