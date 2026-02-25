const changeBodyAttribute = (attribute: any, value: any) => {
    if (document.body) document.body.setAttribute(attribute, value)
    return true;
}

/**
 * Toggle the class on body
 * @param {*} cssClass
 */
const manageBodyClass = (cssClass: any, action: any) => {
    switch (action) {
        case "add":
            if (document.body) document.body.classList.add(cssClass)
            break
        case "remove":
            if (document.body) document.body.classList.remove(cssClass)
            break
        default:
            if (document.body) document.body.classList.toggle(cssClass)
            break
    }

    return true
}

export { changeBodyAttribute, manageBodyClass };