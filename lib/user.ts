import { auth } from "@clerk/nextjs/server";

import React, { Component } from 'react'


const user = () => {
    const { userId } = auth();

    return userId
}

export default user
