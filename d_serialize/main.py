def d_serialize(item, attributes=None):
    """
    convert the given attributes for the item into a dict
    so they can be serialized back to the caller

    :param item: an object, or dictionary
    :param attributes: list of attributes, defaults to all in item
    :return:
    """

    d = {}
    jsonify_types = [list, dict, int, float, str, bool]
    if not attributes:
        if isinstance(item, dict):
            attributes = list(item.keys())
        else:
            attributes = [m for m in dir(item) if not m.startswith("_") and type(getattr(item, m)) in jsonify_types]
    attributes.sort()
    for a in attributes:
        value = getattr(item, a, "")
        if type(value) not in jsonify_types:
            value = str(value)
        d[a] = value
    return d
