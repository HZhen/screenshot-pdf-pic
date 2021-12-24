import Vue from 'vue'
import router from "../../router";
import {service} from './request'
import {DonMessage} from './message'
//设置消息提醒组件
const $message = new DonMessage()

export default {
    params(url, param, resolve, reject, method, successMsg, errorMsg, headers) {
        service({
            method: method,
            url,
            headers: headers,
            [method === 'get' || method === 'delete' ? 'params' : 'data']: param,
        }).then(res => {
            //axios返回的是一个promise对象
            if (res.request.status === 200 && res.data.code === 401) {
                $message.error(res.data.msg)
                reject(res)
            } else if (res.request.status === 200 || res.request.status === 201 ) {
                (successMsg) && ($message.success(successMsg));
                resolve(res.data);   // resolve在promise执行器内部
            } else {
                $message.error(res.data.msg)
                reject(res)
            }
            resolve(res)
        }).catch(err => {
            (errorMsg) && ($message.error(errorMsg));
            !(errorMsg) && ($message.error('网络或服务器出错了'));
            reject(err)
        })
    },

    //get请求，其他类型请求复制粘贴，修改method
    get(url, param, headers, successMsg, errorMsg) {
        return new Promise((resolve, reject) => {
            this.params(url, param, resolve, reject, 'get', successMsg, errorMsg, headers)
        })
    },

    post(url, param, headers, successMsg, errorMsg) {
        return new Promise((resolve, reject) => {
            this.params(url, param, resolve, reject, 'post', successMsg, errorMsg, headers)
        })
    },

    put(url, param, successMsg, errorMsg) {
        return new Promise((resolve, reject) => {
            this.params(url, param, resolve, reject, 'put', successMsg, errorMsg)
        })
    },

    delete(url, param, successMsg, errorMsg) {
        return new Promise((resolve, reject) => {
            this.params(url, param, resolve, reject, 'delete', successMsg, errorMsg)
        })
    },
}