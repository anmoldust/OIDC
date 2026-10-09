package com.oidcdemo.backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException ofId(String resource, Object id) {
        return new ResourceNotFoundException(resource + " not found with id: " + id);
    }
}
