import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/token',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/me',
    method: 'get',
    params: null
  })
}

export function logout() {
  return request({
    url: '/me/token',
    method: 'delete'
  })
}

export function getUserList(query) {
  return request({
    url: '/center/admin',
    method: 'get',
    params: query
  })
}

export function updateUser(id, data) {
  return request({
    url: `/center/admin/${id}`,
    method: 'patch',
    data: data
  })
}

export function createUser( data) {
  return request({
    url: `/center/admin`,
    method: 'post',
    data: data
  })
}

export function deleteUser(id) {
  return request({
    url: `/center/admin/${id}`,
    method: 'delete',
  })
}

export function changeStatus(id) {
  return request({
    url: `/center/admin/${id}/status`,
    method: 'patch',
  })
}

export function resetPassword(id) {
  return request({
    url: `/center/admin/${id}/password`,
    method: 'patch',
  })
}
