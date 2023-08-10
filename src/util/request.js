export const getKramdown = (id) => {
    return fetch('/api/block/getBlockKramdown', {
        method: 'POST',
        body: JSON.stringify({
            id
        })
    }).then((res) => res.json()).then((data) => data.data.kramdown)
}

export const updateBlock = (id, data) => {
    return fetch('/api/block/updateBlock', {
        method: 'POST',
        body: JSON.stringify({
            id,
            dataType: 'markdown',
            data,
        })
    })
}